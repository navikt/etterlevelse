import { Loader } from '@navikt/ds-react'
import React, { JSX, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { user } from '../services/User'

interface IPrivateRouteProps {
  component: JSX.Element
  adminPage?: boolean
  kraveierPage?: boolean
  pvoPage?: boolean
}

export const PrivateRoute = ({
  component,
  adminPage,
  kraveierPage,
  pvoPage,
}: IPrivateRouteProps) => {
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    const timeOut = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timeOut)
  }, [])

  if (isLoading && !user.isLoggedIn()) {
    return <Loader size="large" className="flex justify-self-center" />
  } else {
    if (adminPage) {
      if (user.isAdmin()) {
        return component
      } else {
        return <Navigate to={{ pathname: '/forbidden' }} />
      }
    } else if (kraveierPage) {
      if (user.isKraveier() || user.isAdmin()) {
        return component
      } else {
        return <Navigate to={{ pathname: '/forbidden' }} />
      }
    } else if (pvoPage) {
      if (user.isPersonvernombud() || user.isAdmin()) {
        return component
      } else {
        return <Navigate to={{ pathname: '/forbidden' }} />
      }
    }
  }
}

export default PrivateRoute
