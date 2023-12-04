import { Navigate } from 'react-router-dom'
import React, { useState } from 'react'
import { useUser } from '../services/User'
import { Loader } from '@navikt/ds-react'

interface PrivateRouteProps {
  component: JSX.Element
  adminPage?: boolean
  kraveierPage?: boolean
}

export const PrivateRoute = ({ component, adminPage, kraveierPage }: PrivateRouteProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const user = useUser

  React.useEffect(() => {
    let timeOut = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timeOut)
  }, [])

  if (isLoading) {
    return <Loader size="large" />
  }

  if (user.isLoggedIn()) {
    if (adminPage) {
      if (user.isAdmin()) {
        return component
      } else {
        return <Navigate to={{ pathname: '/forbidden', search: '?role=admin' }} />
      }
    } else if (kraveierPage) {
      if (user.isKraveier() || user.isAdmin()) {
        return component
      } else {
        return <Navigate to={{ pathname: '/forbidden', search: '?role=kraveier' }} />
      }
    } else {
      return component
    }
  } else {
    return <Navigate to={{ pathname: '/forbidden' }} />
  }
}

export default PrivateRoute
