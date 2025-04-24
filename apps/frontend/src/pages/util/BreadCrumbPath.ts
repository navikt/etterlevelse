import {
  etterlevelseDokumentasjonerUrl,
  temaUrl,
} from '../../components/common/RouteLinkEtterlevelsesdokumentasjon'
import { kravlisteUrl } from '../../components/common/RouteLinkKrav'
import { IBreadCrumbPath } from '../../constants'

export const kravBreadCrumbPath: IBreadCrumbPath = {
  href: kravlisteUrl(),
  pathName: 'Forvalte og opprette krav',
}

export const temaBreadCrumbPath: IBreadCrumbPath = {
  pathName: 'Forstå kravene',
  href: temaUrl,
}

export const dokumentasjonerBreadCrumbPath: IBreadCrumbPath = {
  pathName: 'Dokumentere etterlevelse',
  href: etterlevelseDokumentasjonerUrl(),
}

export const dokumentasjonBreadCrumbPath = (pathName: string, href: string): IBreadCrumbPath => {
  const dokumentasjon: IBreadCrumbPath = { pathName: pathName, href: href }

  return dokumentasjon
}
