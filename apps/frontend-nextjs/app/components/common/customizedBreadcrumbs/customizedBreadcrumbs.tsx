'use client'

import { IBreadCrumbPath } from '@/constants/commonConstants'
import { ChevronRightIcon } from '@navikt/aksel-icons'
import { BodyShort, Link } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

interface TCustomizedProps {
  paths?: IBreadCrumbPath[]
  currentPage?: string
  fontColor?: string
}

const CustomizedBreadcrumbs: FunctionComponent<TCustomizedProps> = ({ paths, currentPage }) => {
  const getName = (pathName: string) =>
    pathName.length > 40 ? pathName.substring(0, 40) + '...' : pathName

  return (
    <div className='flex gap-1 items-center my-6'>
      <Link href='/' className='gap-1 flex  break-all'>
        Forsiden <ChevronRightIcon aria-label='Inneholder' aria-hidden />
      </Link>
      {paths?.map((path: IBreadCrumbPath) => (
        <Link
          href={path.href}
          key={`breadcrumb_link_${getName(path.pathName)}`}
          className='gap-1 flex break-all'
        >
          {getName(path.pathName)} <ChevronRightIcon aria-label='Inneholder' aria-hidden />
        </Link>
      ))}
      {currentPage && <BodyShort>{getName(currentPage)}</BodyShort>}
    </div>
  )
}

export default CustomizedBreadcrumbs
