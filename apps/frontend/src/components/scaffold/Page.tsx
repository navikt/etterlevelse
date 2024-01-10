import React from 'react'
import { Helmet } from 'react-helmet'
import CustomizedBreadcrumbs, { IBreadcrumbPaths } from '../common/CustomizedBreadcrumbs'


export const PageLayout = ({
  children,
  pageTitle,
  fullWidth,
  noPadding,
  currentPage,
  breadcrumbPaths,
}: {
  children: React.ReactNode
  pageTitle?: string
  fullWidth?: boolean
  noPadding?: boolean
  currentPage?: string
  breadcrumbPaths?: IBreadcrumbPaths[]
}) => {

  return (
    <div id="content" role="main" className={`flex flex-col w-full bg-white ${fullWidth ? '' : 'max-w-7xl'}`}>
      <div className={`${noPadding ? '' : 'px-2 pb-6'}`}>
        {(currentPage || breadcrumbPaths) && (
          <CustomizedBreadcrumbs currentPage={currentPage} paths={breadcrumbPaths} />
        )}
        {pageTitle && (
          <Helmet>
            <meta charSet="utf-8" />
            <title>{pageTitle}</title>
          </Helmet>
        )}

        {children}
      </div>
    </div>
  )
}
