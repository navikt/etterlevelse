import { IBreadCrumbPath } from '@/constants/commonConstants'
import { TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'
import { temaBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'

export const getBreadcrumbPaths = (kravTema: TTemaCode | undefined): IBreadCrumbPath[] => {
  const breadcrumbPaths: IBreadCrumbPath[] = [temaBreadCrumbPath]

  if (kravTema?.shortName) {
    breadcrumbPaths.push({
      pathName: kravTema.shortName.toString(),
      href: `${temaUrl}/${kravTema.code}`,
    })
  }
  return breadcrumbPaths
}
