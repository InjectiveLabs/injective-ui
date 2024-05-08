import {
  TokenType,
  TokenStatic,
  TokenVerification
} from '@injectivelabs/token-metadata'
import {
  Metadata,
  ContractInfo,
  InsuranceFund,
  isCw20ContractAddress,
  ContractStateWithPagination
} from '@injectivelabs/sdk-ts'
import {
  ibcApi,
  bankApi,
  wasmApi,
  alchemyClient,
  insuranceFundsApi
} from '../Service'
import { unknownToken, injToken } from '../data/token'

export class SharedTokenClient {
  private cachedBankMetadatas: Metadata[] = []
  private cachedInsuranceFunds: InsuranceFund[] = []
  private cachedTokens: Record<string, TokenStatic> = {}

  constructor() {}

  async queryToken(denom: string): Promise<TokenStatic | undefined> {
    const cachedToken = this.cachedTokens[denom.toLowerCase()]

    if (cachedToken) {
      return cachedToken
    }

    if (denom.startsWith('share')) {
      return this.#getInsuranceToken(denom)
    }

    if (denom.startsWith('peggy') || denom.startsWith('0x')) {
      return this.#getPeggyToken(denom)
    }

    if (denom.startsWith('ibc')) {
      return this.#getIbcToken(denom)
    }

    if (denom.startsWith('factory')) {
      const contractAddress = denom.split('/').pop()

      if (!contractAddress) {
        return
      }

      if (isCw20ContractAddress(contractAddress)) {
        return this.#getCw20Token(denom)
      }

      return this.#getTokenFactoryToken(denom)
    }

    return
  }

  async #getIbcToken(denom: string): Promise<TokenStatic | undefined> {
    if (!denom.startsWith('ibc/')) {
      return
    }

    const hash = denom.replace('ibc/', '')
    const data = await ibcApi.fetchDenomTrace(hash)

    if (!data) {
      return {
        ...unknownToken,
        denom,
        hash,
        address: denom
      }
    }

    const token = {
      ...unknownToken,
      hash,
      denom,
      path: data.path,
      baseDenom: data.baseDenom,
      channelId: data.path.split('/').pop() as string
    }

    this.cachedTokens[denom.toLowerCase()] = token

    return token
  }

  async #getPeggyToken(denom: string): Promise<TokenStatic | undefined> {
    if (!denom.startsWith('0x') && !denom.startsWith('peggy')) {
      return
    }

    const address = denom.replace('peggy', '')
    const defaultToken = {
      ...unknownToken,
      denom,
      address
    }

    const alchemyToken = (await alchemyClient.core.getTokenMetadata(
      address
    )) as
      | { decimals: number; logo: string; name: string; symbol: string }
      | undefined

    if (!alchemyToken || !alchemyToken.name || !alchemyToken.symbol) {
      return defaultToken
    }

    const token = {
      ...defaultToken,
      name: alchemyToken.name,
      tokenType: TokenType.Erc20,
      symbol: alchemyToken.symbol,
      decimals: alchemyToken.decimals,
      externalLogo: alchemyToken.logo,
      tokenVerification: TokenVerification.External
    }

    this.cachedTokens[denom.toLowerCase()] = token

    return token
  }

  async #getCw20Token(denom: string): Promise<TokenStatic | undefined> {
    if (!denom.startsWith('factory')) {
      return
    }

    const address = denom.split('/').pop()

    if (!address || !isCw20ContractAddress(address)) {
      return
    }

    const defaultToken = {
      ...unknownToken,
      denom,
      address: address
    }

    const contractInfo = (await wasmApi
      .fetchContractInfo(address)
      .catch(() => {})) as ContractInfo | undefined

    const contractStateResponse = (await wasmApi
      .fetchContractState({
        contractAddress: address,
        pagination: { reverse: true }
      })
      .catch(() => {})) as ContractStateWithPagination | undefined

    if (
      !contractStateResponse ||
      !contractStateResponse.tokenInfo ||
      !contractInfo
    ) {
      return defaultToken
    }

    const { tokenInfo, marketingInfo } = contractStateResponse

    const token = {
      address,
      name: tokenInfo.name,
      logo: unknownToken.logo,
      tokenType: TokenType.Cw20,
      decimals: tokenInfo.decimals,
      coinGeckoId: unknownToken.coinGeckoId,
      tokenVerification: TokenVerification.Internal,
      symbol: tokenInfo?.symbol || unknownToken.symbol,
      denom: `factory/${contractInfo.creator}/${address}`,
      externalLogo: marketingInfo?.logo?.url || unknownToken.logo
    }

    this.cachedTokens[denom.toLowerCase()] = token

    return token
  }

  async #getInsuranceToken(denom: string): Promise<TokenStatic | undefined> {
    if (!denom.startsWith('share')) {
      return
    }

    await this.#fetchInsuranceFunds()

    const insuranceFund = this.cachedInsuranceFunds.find(
      (fund) => fund.insurancePoolTokenDenom === denom
    )

    const defaultToken = {
      denom,
      name: denom,
      decimals: 18,
      symbol: denom,
      address: denom,
      logo: injToken.logo,
      externalLogo: injToken.logo,
      tokenType: TokenType.InsuranceFund,
      coinGeckoId: unknownToken.coinGeckoId
    }

    if (!insuranceFund) {
      return {
        ...defaultToken,
        tokenVerification: TokenVerification.Unverified
      }
    }

    const token = {
      ...defaultToken,
      tokenVerification: TokenVerification.Verified,
      name: `${insuranceFund.marketTicker} Insurance Fund`
    }

    this.cachedTokens[denom.toLowerCase()] = token

    return token
  }

  async #getTokenFactoryToken(denom: string): Promise<TokenStatic | undefined> {
    if (!denom.startsWith('factory')) {
      return
    }

    await this.#fetchBankMetadatas()

    const metadata = this.cachedBankMetadatas.find(
      (metadata) => metadata.base === denom
    )

    if (!metadata) {
      return {
        ...unknownToken,
        denom,
        address: denom,
        tokenType: TokenType.TokenFactory
      }
    }

    const token = {
      ...unknownToken,
      name: metadata.name || unknownToken.name,
      denom: metadata.base || denom,
      address: metadata.base || denom,
      symbol: metadata.symbol || unknownToken.symbol,
      externalLogo: metadata.uri || unknownToken.logo,
      tokenType: TokenType.TokenFactory,
      tokenVerification: TokenVerification.Internal,
      decimals: metadata.denomUnits.pop()?.exponent || unknownToken.decimals
    }

    this.cachedTokens[denom.toLowerCase()] = token

    return token
  }

  async #fetchInsuranceFunds() {
    if (this.cachedInsuranceFunds.length !== 0) {
      return
    }

    this.cachedInsuranceFunds = await insuranceFundsApi.fetchInsuranceFunds()
  }

  async #fetchBankMetadatas() {
    if (this.cachedBankMetadatas.length !== 0) {
      return
    }

    const { metadatas } = await bankApi.fetchDenomsMetadata({
      limit: 10000
    })

    this.cachedBankMetadatas = metadatas
  }
}
