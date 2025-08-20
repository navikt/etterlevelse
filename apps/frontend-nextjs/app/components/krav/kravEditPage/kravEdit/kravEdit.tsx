import { IKravDataProps } from '@/api/krav/kravEdit/kravEditApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { TKravQL } from '@/constants/krav/kravConstants'
import { kravBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Loader } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  krav: TKravQL | undefined
  kravData: IKravDataProps | undefined
}

export const KravEdit: FunctionComponent<TProps> = ({ krav, kravData }) => {
  const kravLoading: boolean | undefined = kravData?.kravLoading

  return (
    <PageLayout
      pageTitle='Rediger krav'
      currentPage='Rediger krav'
      breadcrumbPaths={[kravBreadCrumbPath]}
      key={`K${krav?.kravNummer}${krav?.kravVersjon}`}
    >
      {kravLoading && (
        <div className='w-full flex items-center flex-col'>
          <Loader size='3xlarge' />
        </div>
      )}

      {!kravLoading && <div>FOM</div>}
    </PageLayout>
  )
}
