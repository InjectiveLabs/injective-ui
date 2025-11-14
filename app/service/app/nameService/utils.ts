import { keccak256 } from 'viem'
import { validate, normalize } from '@bangjelkoski/ens-validation'
import { ErrorType, GeneralException } from '@injectivelabs/exceptions'
import {
  hexToUint8Array,
  concatUint8Arrays,
  stringToUint8Array
} from '@injectivelabs/sdk-ts'

const nameHash = (inputName: string) => {
  // Start with 32 zero bytes (0x0000...0000)
  let node = '0000000000000000000000000000000000000000000000000000000000000000'

  if (inputName) {
    const labels = inputName.split('.')

    for (let i = labels.length - 1; i >= 0; i -= 1) {
      const normalizedLabel = normalize(labels[i])
      // keccak256 from viem accepts string or Uint8Array
      const labelSha = keccak256(
        stringToUint8Array(normalizedLabel),
        'hex'
      ).slice(2) // Remove 0x prefix

      // Concatenate node + labelSha and hash
      const combined = concatUint8Arrays([
        hexToUint8Array(node),
        hexToUint8Array(labelSha)
      ])
      node = keccak256(combined, 'hex').slice(2) // Remove 0x prefix
    }
  }

  return `0x${node}`
}

const nameToNode = (name: string) => {
  if (!name) {
    return []
  }

  const hash = nameHash(name)

  // Convert hex string to array (skip the 0x prefix)
  return Array.from(hexToUint8Array(hash.slice(2)))
}

const validateNameLength = (label: string) => {
  if (typeof label !== 'string') {
    return 0
  }

  return !(label.length < 3 || label.length > 512)
}

const validateName = (name: string) => {
  if (!name) {
    return false
  }

  if (!validateNameLength(name)) {
    return false
  }

  const blackList =
    // eslint-disable-next-line no-control-regex,no-misleading-character-class
    /[\u0000-\u002c\u002e-\u002f\u003a-\u005e\u0060\u007b-\u007f\u200b\u200c\u200d\ufeff]/g

  if (blackList.test(name)) {
    return false
  }

  if (!validate(name)) {
    return false
  }

  return true
}

const normalizeName = (name: string) => {
  if (!name) {
    throw new GeneralException(new Error('Invalid Domain'), {
      context: 'Params',
      type: ErrorType.ValidationError
    })
  }

  const labelArr = name.split('.')
  const emptyLabel = labelArr.find((i) => i.length < 1)

  if (emptyLabel !== undefined) {
    throw new GeneralException(new Error('Domain cannot have empty labels'), {
      context: 'Params',
      type: ErrorType.ValidationError
    })
  }

  let normalizedArray: string[]

  try {
    normalizedArray = labelArr.map((e) => normalize(e))
  } catch {
    throw new GeneralException(new Error('Invalid Domain'), {
      context: 'Params',
      type: ErrorType.ValidationError
    })
  }

  const normalizedDomain = normalizedArray.join('.')

  let label = normalizedDomain

  if (normalizedArray.length > 1) {
    label = normalizedArray.slice(0, normalizedArray.length - 1).join('.')
  }

  if (!validateName(label)) {
    throw new GeneralException(new Error('Invalid Domain'), {
      context: 'Params',
      type: ErrorType.ValidationError
    })
  }

  return normalizedDomain
}

export { nameToNode, normalizeName }
