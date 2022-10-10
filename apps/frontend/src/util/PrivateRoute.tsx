import { IndexRouteProps, LayoutRouteProps, Navigate, PathRouteProps, Route } from 'react-router-dom'
import React, { useState } from 'react'
import { user } from '../services/User'
import { Spinner } from 'baseui/icon'
import { ettlevColors, theme } from './theme'

interface PrivateRouteProps {
  component: JSX.Element
  adminPage: boolean
}


export const PrivateRoute = ({ component, adminPage }: PrivateRouteProps) => {
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {

    let interval = setInterval(() => {
      setIsLoading(false)
    }, 1)

    return () => clearInterval(interval)
  }, [])


  if (isLoading) {
    return <Spinner $color={ettlevColors.green400} $size={theme.sizing.scale2400} />
  }

  if (user.isLoggedIn()) {
    if (adminPage) {
      if (user.isAdmin()) {
        return component
      } else {
        return <Navigate to={{ pathname: '/forbidden' }} />
      }
    } else {
      return component
    }
  } else {
    return <Navigate to={{ pathname: '/forbidden' }} />
  }
}



export default PrivateRoute