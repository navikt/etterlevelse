'use client'

import { UserContext } from '@/provider/user/userProvider'
import { useRouter } from 'next/navigation'
import { FunctionComponent, ReactNode, useContext, useEffect, useState } from 'react'
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
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (user.isLoaded()) {
      if (adminPage && !user.isAdmin()) {
        router.push('/forbidden')
      } else if (kraveierPage && !user.isAdmin() && !user.isKraveier()) {
        router.push('/forbidden')
      } else if (pvoPage && !user.isAdmin() && !user.isPersonvernombud()) {
        router.push('/forbidden')
      } else {
        setIsLoading(false)
      }
    }
  }, [user])

  return (
    <>
      {isLoading && <CenteredLoader />}
      {!isLoading && children}
    </>
  )
}

export default AuthCheckComponent
