import { Portrait } from '@/components/common/portrait/portrait'
import { user } from '@/services/user/user'
import { Label } from '@navikt/ds-react'
import { getUserRole } from '../user'

export const UserInfoView = () => {
  // const location = useLocation()
  // const frontpage = window.location.href.substr(0, window.location.href.length - location.pathname.length)
  // const path = location.pathname
  return (
    <div className='flex mb-4'>
      <Portrait ident={user.getIdent()} size={'3rem'} />
      <div className='flex flex-col ml-6'>
        <Label>{user.getName()}</Label>
        <Label size='small'>{getUserRole()}</Label>
      </div>
      {/* <div className="flex self-end ml-6">
        <Link href={`/logout?redirect_uri=${frontpage}${path}`}>Logg ut</Link>
      </div> */}
    </div>
  )
}
