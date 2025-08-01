import CustomizedBreadcrumbs from '@/components/common/customizedBreadcrumbs/customizedBreadcrumbs'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { FunctionComponent, ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'

type TProps = {
  children: ReactNode
  pageTitle?: string
  fullWidth?: boolean
  noPadding?: boolean
  currentPage?: string
  breadcrumbPaths?: IBreadCrumbPath[]
}

export const PageLayout: FunctionComponent<TProps> = ({
  children,
  pageTitle,
  fullWidth,
  noPadding,
  currentPage,
  breadcrumbPaths,
}) => (
  <div
    id='content'
    role='main'
    className={`flex flex-col w-full bg-white ${fullWidth ? '' : 'max-w-7xl'}`}
  >
    <div className={`${noPadding ? '' : 'px-2 pb-6'}`}>
      {(currentPage || breadcrumbPaths) && (
        <CustomizedBreadcrumbs currentPage={currentPage} paths={breadcrumbPaths} />
      )}
      {pageTitle && (
        <Helmet>
          <meta charSet='utf-8' />
          <title>{pageTitle}</title>
        </Helmet>
      )}

      {children}
    </div>
  </div>
)
