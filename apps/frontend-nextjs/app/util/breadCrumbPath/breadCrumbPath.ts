import { IBreadCrumbPath } from '@/constants/commonConstants'
import { etterlevelseDokumentasjonerUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'
import { kravlisteQueryUrl } from '@/routes/krav/kravRoutes'

export const temaBreadCrumbPath: IBreadCrumbPath = {
  pathName: 'Forstå kravene',
  href: temaUrl,
}

export const kravBreadCrumbPath: IBreadCrumbPath = {
  href: kravlisteQueryUrl(),
  pathName: 'Forvalte og opprette krav',
}

export const dokumentasjonerBreadCrumbPath: IBreadCrumbPath = {
  pathName: 'Dokumentere etterlevelse',
  href: etterlevelseDokumentasjonerUrl(),
}

export const dokumentasjonBreadCrumbPath = (pathName: string, href: string): IBreadCrumbPath => {
  const dokumentasjon: IBreadCrumbPath = { pathName: pathName, href: href }

  return dokumentasjon
}
