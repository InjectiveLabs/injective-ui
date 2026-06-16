import { GeneralException } from '@injectivelabs/exceptions'
import type { InjNameService } from './app/nameService'
import type { InjBonfidaNameService } from './app/bonfida'

let injNameServicePromise: undefined | Promise<InjNameService>
let injBonfidaNameServicePromise: undefined | Promise<InjBonfidaNameService>

const getInjNameService = () => {
  if (!injNameServicePromise) {
    injNameServicePromise = import('./name').then(
      ({ injNameService }) => injNameService
    )
  }

  return injNameServicePromise
}

const getInjBonfidaNameService = () => {
  if (!injBonfidaNameServicePromise) {
    injBonfidaNameServicePromise = import('./name').then(
      ({ injBonfidaNameService }) => injBonfidaNameService
    )
  }

  return injBonfidaNameServicePromise
}

export const injNameService = {
  fetchInjName: (address: string) =>
    getInjNameService().then((service) => service.fetchInjName(address)),
  fetchInjAddress: (name: string) =>
    getInjNameService().then((service) => service.fetchInjAddress(name))
} satisfies Pick<InjNameService, 'fetchInjName' | 'fetchInjAddress'>

export const injBonfidaNameService = {
  fetchInjName: (_address: string) => {
    throw new GeneralException(new Error(`Not suported for this name service`))
  },
  fetchInjAddress: (name: string) =>
    getInjBonfidaNameService().then((service) => service.fetchInjAddress(name))
} satisfies Pick<InjBonfidaNameService, 'fetchInjName' | 'fetchInjAddress'>
