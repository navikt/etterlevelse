import { IBreadCrumbPath } from '@/constants/common/constants'
import { ChevronRightIcon } from '@navikt/aksel-icons'
import { BodyShort, Link } from '@navikt/ds-react'

interface IProps {
  paths?: IBreadCrumbPath[]
  currentPage?: string
  fontColor?: string
}

type TCustomizedProps = IProps

const CustomizedBreadcrumbs = (props: TCustomizedProps) => {
  const { paths, currentPage } = props

  const getName = (pathName: string) =>
    pathName.length > 40 ? pathName.substring(0, 40) + '...' : pathName
  const linkColor = /^\/(lov|etterlevelse)\//.test(window.location.pathname)
    ? 'text-white'
    : 'text-gray-800'

  return (
    <div className='flex gap-1 items-center my-6'>
      <Link href='/' className={`gap-1 flex ${linkColor} focus:text-white break-all`}>
        Forsiden <ChevronRightIcon area-label='' aria-hidden />
      </Link>
      {paths?.map((path) => (
        <Link
          href={path.href}
          key={`breadcrumb_link_${getName(path.pathName)}`}
          className={`gap-1 flex ${linkColor} focus:text-white break-all`}
        >
          {getName(path.pathName)} <ChevronRightIcon area-label='' aria-hidden />
        </Link>
      ))}
      {currentPage && (
        <BodyShort className={`${linkColor} focus:text-white`}>{getName(currentPage)}</BodyShort>
      )}
    </div>
  )
}

export default CustomizedBreadcrumbs
