import { Heading } from '@navikt/ds-react'
import { PageLayout } from '../components/scaffold/Page'
import { IBreadCrumbPath } from '../constants'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const PvkBehovPage = () => {
  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]

  return (
    <PageLayout
      pageTitle="Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?"
      currentPage="Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?"
      breadcrumbPaths={breadcrumbPaths}
    >
      <Heading level="1" size="medium">
        Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?
      </Heading>

      <div className="flex w-full">
        <div className="pr-4 flex flex-1 flex-col gap-4 col-span-8">
          TEST 1<div>test 1</div>
        </div>
        <div className="pl-4 border-l border-border-divider w-full max-w-sm">
          TEST 2<div>test 1</div>
        </div>
      </div>
    </PageLayout>
  )
}

export default PvkBehovPage
