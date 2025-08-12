import CustomizedBreadcrumbs from '@/components/common/customizedBreadcrumbs/customizedBreadcrumbs'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import Head from 'next/head'
import { FunctionComponent, ReactNode } from 'react'

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
        <Head>
          <meta charSet='utf-8' />
          <title>{pageTitle}</title>
        </Head>
      )}

      {children}
    </div>
  </div>
)
