'use client'

import { Portrait } from '@/components/common/portrait/portrait'
import { UserContext } from '@/provider/user/userProvider'
import { Label, Link } from '@navikt/ds-react'
import { usePathname } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'

export const UserInfoView = () => {
  const pathname: string = usePathname()
  const { getIdent, getName, getUserRoleText } = useContext(UserContext)
  const [frontpage, setFrontpage] = useState<string>('')

  useEffect(() => {
    setFrontpage(window.location.href.substring(0, window.location.href.length - pathname.length))
  }, [pathname])

  return (
    <div className='flex mb-4'>
      <Portrait ident={getIdent()} size='3rem' />
      <div className='flex flex-col ml-6'>
        <Label>{getName()}</Label>
        <Label size='small'>{getUserRoleText()}</Label>
      </div>
      <div className='flex self-end ml-6'>
        <Link href={`/logout?redirect_uri=${frontpage}${pathname}`}>Logg ut</Link>
      </div>
    </div>
  )
}
