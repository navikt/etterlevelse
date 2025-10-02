'use client'

import { getMeldingByType } from '@/api/melding/meldingApi'
import { Markdown } from '@/components/common/markdown/markdown'
import { EMeldingStatus, EMeldingType, IMelding } from '@/constants/admin/message/messageConstants'
import { EAlertType, IPageResponse } from '@/constants/commonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import { getEtterlevelseDokumentasjonListQuery } from '@/query/etterlevelseDokumentasjon/etterlevelseDokumentasjonQuery'
import { etterlevelseDokumentasjonCreateUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import { etterlevelseDokumentasjonerUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { useQuery } from '@apollo/client/react'
import { Alert, Button, Heading, Skeleton } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { EtterlevelseDokumentasjonList } from './etterlevelseDokumentasjonslist/etterlevelseDokumentasjonslist'

type TVariables = {
  pageNumber?: number
  pageSize?: number
  sistRedigert?: number
  mineEtterlevelseDokumentasjoner?: boolean
  sok?: string
  teams?: string[]
  behandlingId?: string
}

export const EtterlevelseDokumentasjon = () => {
  const router: AppRouterInstance = useRouter()
  const user = useContext(UserContext)

  const [forsideVarsel, setForsideVarsle] = useState<IMelding>()

  const { data, loading: etterlevelseDokumentasjonLoading } = useQuery<
    { etterlevelseDokumentasjoner: IPageResponse<TEtterlevelseDokumentasjonQL> },
    TVariables
  >(getEtterlevelseDokumentasjonListQuery, {
    variables: { sistRedigert: 20 },
    skip: !user.isLoggedIn(),
  })

  useEffect(() => {
    // ampli.logEvent('sidevisning', { side: 'Hovedside', ...userRoleEventProp })
    ;(async () => {
      await getMeldingByType(EMeldingType.FORSIDE).then((response: IPageResponse<IMelding>) => {
        if (response.numberOfElements > 0) {
          setForsideVarsle(response.content[0])
        }
      })
    })()
  }, [])

  return (
    <>
      {forsideVarsel?.meldingStatus === EMeldingStatus.ACTIVE && (
        <div className=' my-16 w-full justify-center flex'>
          <div className='w-fit' id='forsideVarselMelding'>
            {forsideVarsel.alertType === EAlertType.INFO && (
              <Alert fullWidth variant='info'>
                <Markdown source={forsideVarsel.melding} />
              </Alert>
            )}
            {forsideVarsel.alertType !== EAlertType.INFO && (
              <Alert fullWidth variant='warning'>
                <Markdown source={forsideVarsel.melding} />
              </Alert>
            )}
          </div>
        </div>
      )}
      {etterlevelseDokumentasjonLoading && (
        <div className='bg-white mt-8 p-8 shadow-md shadow-[#00000040]'>
          <Heading as={Skeleton} size='large'>
            Card-title
          </Heading>
          <Skeleton variant='text' width='100%' />
          <Skeleton variant='text' width='100%' />
        </div>
      )}
      {!etterlevelseDokumentasjonLoading && data?.etterlevelseDokumentasjoner.content && (
        <div className='bg-white mt-8 p-8 shadow-md shadow-[#00000040]'>
          {data?.etterlevelseDokumentasjoner.content.length === 0 && (
            <div>
              <Heading size='medium' level='2'>
                Etterlevelse i Nav
              </Heading>
              <span>
                For å dokumentere etterlevelse må du opprette et etterlevelsesdokument. Du vil da se
                hvilke krav som gjelder for din løsning og kan dokumentere hvordan løsningen
                etterlever kravene.
              </span>
            </div>
          )}
          {data?.etterlevelseDokumentasjoner.content.length !== 0 && (
            <EtterlevelseDokumentasjonList
              etterlevelseDokumentasjoner={data?.etterlevelseDokumentasjoner.content}
            />
          )}
          <div className='mt-8 flex justify-end'>
            <div className='mr-4'>
              <Button
                onClick={() => {
                  window.scrollTo(0, 0)
                  // ampli.logEvent('knapp klikket', {
                  //   tekst: 'Nytt etterlevelsesdokument fra forsiden',
                  // })
                  router.push(etterlevelseDokumentasjonCreateUrl)
                }}
                size='medium'
                variant={data?.etterlevelseDokumentasjoner.content.length ? 'secondary' : 'primary'}
                className='whitespace-nowrap ml-5'
              >
                Nytt etterlevelsesdokument
              </Button>
            </div>
            <Button
              variant='tertiary'
              className='underline hover:no-underline'
              onClick={() => {
                window.scrollTo(0, 0)
                // ampli.logEvent('navigere', {
                //   app: 'etterlevelse',
                //   kilde: 'forside-panel',
                //   til: etterlevelseDokumentasjonerUrl(),
                //   fra: '/',
                // })
                router.push(etterlevelseDokumentasjonerUrl())
              }}
            >
              Alle etterlevelsesdokumenter
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
