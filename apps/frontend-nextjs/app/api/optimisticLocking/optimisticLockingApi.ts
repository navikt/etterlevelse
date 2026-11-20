import axios, { AxiosError } from 'axios'

// Må samsvare med OptimisticLockingExceptionHandler.OPTIMISTIC_LOCKING_FAILURE i backend
export const OPTIMISTIC_LOCKING_FAILURE = 'OPTIMISTIC_LOCKING_FAILURE'

export const OPTIMISTIC_LOCKING_MESSAGE =
  'Dataene er endret av en annen siden du åpnet dem. Endringene dine er ikke lagret. Siden lastes inn på nytt med de nyeste dataene.'

/**
 * True hvis feilen er en versjonskonflikt (HTTP 409 fra optimistisk låsing i backend).
 * Andre 409-feil (f.eks. kodeverk som ikke kan slettes) gir false.
 */
export const isOptimisticLockingError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false
  const axiosError = error as AxiosError<{ type?: string }>
  return (
    axiosError.response?.status === 409 &&
    axiosError.response?.data?.type === OPTIMISTIC_LOCKING_FAILURE
  )
}

/**
 * Lager query-string for valgfri versjonssjekk ved sletting.
 */
export const versionParam = (version?: number): string =>
  version !== undefined && version !== null && version >= 0 ? `&version=${version}` : ''

let interceptorRegistered = false

/**
 * Global håndtering av versjonskonflikt: brukeren får beskjed og siden lastes på nytt,
 * slik at ingen data overskrives i stillhet. Feilen sendes fortsatt videre til kallende kode.
 */
export const registerOptimisticLockingInterceptor = () => {
  if (interceptorRegistered) return
  interceptorRegistered = true

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (isOptimisticLockingError(error) && typeof window !== 'undefined') {
        window.alert(OPTIMISTIC_LOCKING_MESSAGE)
        window.location.reload()
      }
      return Promise.reject(error)
    }
  )
}
