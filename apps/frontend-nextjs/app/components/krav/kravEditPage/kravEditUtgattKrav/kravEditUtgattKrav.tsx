import { PageLayout } from '@/components/others/scaffold/scaffold'
import { TKravQL } from '@/constants/krav/kravConstants'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { kravBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Box, Button } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { FunctionComponent } from 'react'

type TProps = {
  krav: TKravQL
}

export const KravEditUtgattKrav: FunctionComponent<TProps> = ({ krav }) => {
  const router: AppRouterInstance = useRouter()

  return (
    <PageLayout
      pageTitle='Rediger krav'
      currentPage='Rediger krav'
      breadcrumbPaths={[kravBreadCrumbPath]}
      key={`K${krav?.kravNummer}${krav?.kravVersjon}`}
    >
      <Box padding='4' background='surface-warning-subtle'>
        Det er ikke lov å redigere på et utgått krav.
      </Box>
      <Button
        className='mt-4'
        variant='secondary'
        type='button'
        onClick={() => {
          if (krav.kravNummer && krav.kravVersjon) {
            router.push(kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon))
          }
        }}
      >
        Gå tilbake
      </Button>
    </PageLayout>
  )
}
