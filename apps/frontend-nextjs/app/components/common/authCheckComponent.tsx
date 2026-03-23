'use client'

import { UserContext } from '@/provider/user/userProvider'
import { useRouter } from 'next/navigation'
import { FunctionComponent, ReactNode, useContext, useEffect } from 'react'
import { CenteredLoader } from './centeredLoader/centeredLoader'

type TProps = {
  children: ReactNode
  adminPage?: boolean
  kraveierPage?: boolean
  pvoPage?: boolean
}

export const AuthCheckComponent: FunctionComponent<TProps> = ({
  children,
  adminPage,
  kraveierPage,
  pvoPage,
}) => {
  const user = useContext(UserContext)
  const router = useRouter()

  const isForbidden =
    user.isLoaded() &&
    ((adminPage && !user.isAdmin()) ||
      (kraveierPage && !user.isAdmin() && !user.isKraveier()) ||
      (pvoPage && !user.isAdmin() && !user.isPersonvernombud()))

  const isLoading = !user.isLoaded() || isForbidden

  useEffect(() => {
    if (isForbidden) {
      router.push('/forbidden')
    }
  }, [isForbidden, router])

  return (
    <>
      {isLoading && <CenteredLoader />}
      {!isLoading && children}
    </>
  )
}

export default AuthCheckComponent
