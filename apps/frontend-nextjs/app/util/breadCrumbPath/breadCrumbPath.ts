import { IBreadCrumbPath } from '@/constants/commonConstants'
import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'
import { kravlisteUrl } from '@/routes/krav/kraveier/kraveierRoutes'

export const temaBreadCrumbPath: IBreadCrumbPath = {
  pathName: 'Forstå kravene',
  href: temaUrl,
}

export const kravBreadCrumbPath: IBreadCrumbPath = {
  href: kravlisteUrl(),
  pathName: 'Forvalte og opprette krav',
}
