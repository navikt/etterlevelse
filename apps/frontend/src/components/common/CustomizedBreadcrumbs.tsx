import { BodyShort, Link } from '@navikt/ds-react'
import { ChevronRightIcon } from '@navikt/aksel-icons'

export interface breadcrumbPaths {
  href: string
  pathName: string
}

interface Props {
  paths?: breadcrumbPaths[]
  currentPage?: string
  fontColor?: string
}

type CustomizedProps = Props

const CustomizedBreadcrumbs = (props: CustomizedProps) => {
  const getName = (pathName: string) => (pathName.length > 25 ? pathName.substring(0, 25) + '...' : pathName)
  const linkColor = /^\/(lov|krav|etterlevelse)\//.test(window.location.pathname) ? 'text-white' : 'text-text-default'

  return (
    <div className="flex gap-1 items-center my-6">
      <Link href="/" className={`gap-1 flex ${linkColor}`}>
        Forsiden <ChevronRightIcon area-label="" aria-hidden />
      </Link>
      {props.paths?.map((path) => (
        <Link href={path.href} key={'breadcrumb_link_' + getName(path.pathName)} className={`gap-1 flex ${linkColor}`}>
          {getName(path.pathName)} <ChevronRightIcon area-label="" aria-hidden />
        </Link>
      ))}
      {props.currentPage && <BodyShort className={linkColor}>{getName(props.currentPage)}</BodyShort>}
    </div>
  )
}

export default CustomizedBreadcrumbs
