import { Portrait } from '@/components/common/portrait/portrait'
import { user } from '@/services/user/user'
import { Label, Link } from '@navikt/ds-react'
import { usePathname } from 'next/navigation'
import { getUserRole } from '../user'

export const UserInfoView = () => {
  const pathname: string = usePathname()
  const path: string = pathname
  const frontpage: string = window.location.href.substring(
    0,
    window.location.href.length - pathname.length
  )

  return (
    <div className='flex mb-4'>
      <Portrait ident={user.getIdent()} size='3rem' />
      <div className='flex flex-col ml-6'>
        <Label>{user.getName()}</Label>
        <Label size='small'>{getUserRole()}</Label>
      </div>
      <div className='flex self-end ml-6'>
        <Link href={`/logout?redirect_uri=${frontpage}${path}`}>Logg ut</Link>
      </div>
    </div>
  )
}
