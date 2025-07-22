'use client'

import { logApi } from '@/api/other/logApi/logApi'
import { getMeldingByType } from '@/api/other/meldingApi/meldingApi'
import { Markdown } from '@/components/common/markdown/markdown'
import SkipToContent from '@/components/common/skipToContent/skipToContent'
import { EAlertType, IPageResponse } from '@/constants/constant'
import { EMeldingStatus, EMeldingType, IMelding } from '@/constants/other/message/constants'
import { loginUrl } from '@/routes/other/login/routes'
import { user } from '@/services/user/user'
import { useQueryParam } from '@/util/hooks/customHooks/customHooks'
import { InternalHeader, Spacer } from '@navikt/ds-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FunctionComponent, useEffect, useState } from 'react'
import { informationIcon, warningAlert } from '../../images/images'
import { LoggedInHeader, LoginHeaderButton } from './login/login'
import MainSearch from './mainSearch/mainSearch'

let sourceReported = false

type TProps = {
  noSearchBar?: boolean
  noLoginButton?: boolean
}

const Header: FunctionComponent<TProps> = ({ noSearchBar, noLoginButton }) => {
  const [systemVarsel, setSystemVarsel] = useState<IMelding>()
  const pathname: string = usePathname()

  const source = useQueryParam('source')
  if (!sourceReported) {
    sourceReported = true
    logApi('info', 'pageload', `pageload from ${source}`)
  }

  useEffect(() => {
    setTimeout(() => {
      if (!user.isLoggedIn() && typeof window !== 'undefined') {
        window.location.href = loginUrl(window.location.href, pathname)
      }
    }, 1000)
  }, [])

  useEffect(() => {
    ;(async () => {
      await getMeldingByType(EMeldingType.SYSTEM).then((response: IPageResponse<IMelding>) => {
        if (response.numberOfElements > 0) {
          setSystemVarsel(response.content[0])
        }
      })
    })()
  }, [pathname])

  return (
    <div className='w-full'>
      <div className='w-full flex justify-center'>
        <SkipToContent />
        <InternalHeader className='w-full justify-center items-center'>
          <div className='max-w-7xl flex w-full'>
            <InternalHeader.Title href='/'>Støtte til etterlevelse</InternalHeader.Title>
            <Spacer />
            {!noSearchBar && (
              <div
                className='hidden lg:flex w-full max-w-xl justify-center items-center'
                role='search'
              >
                <MainSearch />
              </div>
            )}
            <Spacer />
            {!noLoginButton && (
              <div className='flex'>
                {!user.isLoggedIn() && <LoginHeaderButton />}
                {user.isLoggedIn() && <LoggedInHeader />}
              </div>
            )}
          </div>
        </InternalHeader>
      </div>
      <div
        className='flex lg:hidden bg-gray-900 py-1 px-1 w-full justify-center items-center'
        role='search'
      >
        <div className=' max-w-xl w-full '>
          <MainSearch />
        </div>
      </div>
      {systemVarsel && systemVarsel.meldingStatus === EMeldingStatus.ACTIVE && (
        <div className='w-full flex justify-center'>
          <div
            className={`flex
          flex-col
          items-center
          py-2
          border-b
          border-t
          w-full
          ${
            systemVarsel.alertType === 'INFO'
              ? 'bg-[#d8f9ff] border-[#66cbec]'
              : 'bg-[#ffeccc] border-[#ff9100]'
          }`}
            aria-label='Systemvarsel'
            role='status'
          >
            <div className='flex gap-2'>
              <div className='flex items-baseline pt-1'>
                <Image
                  src={systemVarsel.alertType === EAlertType.INFO ? informationIcon : warningAlert}
                  width='18'
                  height='18'
                  alt={
                    systemVarsel.alertType === EAlertType.INFO ? 'information icon' : 'warning icon'
                  }
                />
              </div>
              <Markdown source={systemVarsel.melding} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Header
