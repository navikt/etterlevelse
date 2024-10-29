import { PageLayout } from '../components/scaffold/Page'
import { IBreadCrumbPath } from '../constants'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const BehandlingensLivslopPage = () => {
  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]
  return (
    <PageLayout
      pageTitle="Behandlingens livsløp"
      currentPage="Behandlingens livsløp"
      breadcrumbPaths={breadcrumbPaths}
    >
      WIP
    </PageLayout>
  )
}

export default BehandlingensLivslopPage
