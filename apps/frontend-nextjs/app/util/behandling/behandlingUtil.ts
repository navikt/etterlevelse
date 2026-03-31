import {
  IBehandling,
  IDpBehandling,
} from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { env } from '../env/env'

export const behandlingName = (behandling?: IBehandling): string => {
  let behandlingName = ''

  if (behandling) {
    if (behandling.nummer) {
      behandlingName += 'B' + behandling.nummer + ' '
    }
    if (behandling.overordnetFormaal && behandling.overordnetFormaal.shortName) {
      behandlingName += behandling.overordnetFormaal.shortName + ': '
    }
    if (behandling.navn) {
      behandlingName += behandling.navn
    }
  }

  return behandlingName
}

export const dpBehandlingName = (dpBehandling?: IDpBehandling): string => {
  let dpBehandlingName = ''

  if (dpBehandling) {
    if (dpBehandling.nummer) {
      dpBehandlingName += 'D' + dpBehandling.nummer + ': '
    }
    if (dpBehandling.navn) {
      dpBehandlingName += dpBehandling.navn
    }
  }

  return dpBehandlingName
}

export const getPollyBaseUrl = () => {
  return `${env.pollyBaseUrl}${env.isDev ? '.dev' : ''}.nav.no/`
}
