import { PageLayout } from '@/components/others/scaffold/scaffold'
import { kravBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'

export const KravCreatePage = () => (
  <PageLayout
    pageTitle='Opprett nytt krav'
    currentPage='Opprett nytt krav'
    breadcrumbPaths={[kravBreadCrumbPath]}
  >
    <div>LOADING</div>
    <div>NOT LOADING</div>
  </PageLayout>
)
