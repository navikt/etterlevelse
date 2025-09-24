import { etterlevelseDokumentasjonerUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { Tabs } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'

export const DokumentasjonTabs = () => {
  const router: AppRouterInstance = useRouter()

  return (
    <Tabs
      onChange={(argument: string) => {
        router.push(etterlevelseDokumentasjonerUrl(argument))
      }}
    >
      A
    </Tabs>
  )
}
