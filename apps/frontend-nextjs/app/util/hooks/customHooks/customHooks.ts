import { usePathname } from 'next/navigation'

export let updateUser: () => void

export function useQueryParam<T extends string>(queryParam: string) {
  return (useQuery().get(queryParam) as T) || undefined
}

function useQuery() {
  return new URLSearchParams(usePathname())
}
