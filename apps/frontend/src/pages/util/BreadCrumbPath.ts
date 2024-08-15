import { IBreadCrumbPath } from '../../constants'

export const kravBreadCrumbPath: IBreadCrumbPath = {
  href: '/kravliste',
  pathName: 'Forvalte og opprette krav',
}

export const temaBreadCrumbPath: IBreadCrumbPath = {
  pathName: 'Forstå kravene',
  href: '/tema',
}

export const dokumentasjonerBreadCrumbPath: IBreadCrumbPath = {
  pathName: 'Dokumenter etterlevelse',
  href: '/dokumentasjoner',
}

export const dokumentasjonBreadCrumbPath = (pathName: string, href: string): IBreadCrumbPath => {
  const dokumentasjon: IBreadCrumbPath = { pathName: pathName, href: href }

  return dokumentasjon
}
