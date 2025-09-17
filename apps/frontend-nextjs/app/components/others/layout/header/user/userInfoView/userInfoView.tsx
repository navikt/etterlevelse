'use client'

import { Portrait } from '@/components/common/portrait/portrait'
import { user } from '@/services/user/userService'
import { getUserRole } from '@/util/user/userUtil'
import { Label, Link } from '@navikt/ds-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export const UserInfoView = () => {
  const pathname: string = usePathname()
  const [frontpage, setFrontpage] = useState<string>('')

  useEffect(() => {
    setFrontpage(window.location.href.substring(0, window.location.href.length - pathname.length))
  }, [pathname])

  return (
    <div className='flex mb-4'>
      <Portrait ident={user.getIdent()} size='3rem' />
      <div className='flex flex-col ml-6'>
        <Label>{user.getName()}</Label>
        <Label size='small'>{getUserRole()}</Label>
      </div>
      <div className='flex self-end ml-6'>
        <Link href={`/logout?redirect_uri=${frontpage}${pathname}`}>Logg ut</Link>
      </div>
    </div>
  )
}
