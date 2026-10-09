'use client'

import { useQuery } from '@apollo/client/react'
import { Alert, Button, Heading, Link } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { getMeldingByType } from '@/api/melding/meldingApi'
import { Markdown } from '@/components/common/markdown/markdown'
import { EMeldingStatus, EMeldingType, IMelding } from '@/constants/admin/message/messageConstants'
import { EAlertType, IPageResponse } from '@/constants/commonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import { getEtterlevelseDokumentasjonListQuery } from '@/query/etterlevelseDokumentasjon/etterlevelseDokumentasjonQuery'
import { etterlevelseDokumentasjonCreateUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import { etterlevelseDokumentasjonerUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import UtforskEtterlevelse from '../UtforskEtterlevelse'
import { MineSistDokumenterte } from './etterlevelseDokumentasjonslist/etterlevelseDokumentasjonslist'

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
    ;(async () => {
      await getMeldingByType(EMeldingType.FORSIDE).then((response: IPageResponse<IMelding>) => {
        if (response.numberOfElements > 0) {
          setForsideVarsle(response.content[0])
        }
      })
    })()
  }, [])

  return (
    <div className='flex flex-col items-center w-full'>
      <div className='max-w-7xl w-full px-4 py-10'>
        {forsideVarsel?.meldingStatus === EMeldingStatus.ACTIVE && (
          <div className='mb-10 flex justify-center' id='forsideVarselMelding'>
            <Alert
              fullWidth
              variant={forsideVarsel.alertType === EAlertType.INFO ? 'info' : 'warning'}
            >
              <Markdown source={forsideVarsel.melding} />
            </Alert>
          </div>
        )}

        <div className='flex flex-wrap items-center justify-between gap-4'>
          <Heading size='large' level='1'>
            Støtte til etterlevelse
          </Heading>
          <div className='flex flex-wrap items-center gap-4'>
            <Button
              variant='secondary'
              onClick={() => {
                window.scrollTo(0, 0)
                router.push(etterlevelseDokumentasjonCreateUrl)
              }}
            >
              Opprett nytt etterlevelsesdokument
            </Button>
            <Link href={etterlevelseDokumentasjonerUrl()} onClick={() => window.scrollTo(0, 0)}>
              Se alle etterlevelsesdokumenter
            </Link>
          </div>
        </div>

        <div className='mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6'>
          <div className='order-2 lg:order-1 lg:col-span-2'>
            <UtforskEtterlevelse />
          </div>
          <div className='order-1 lg:order-2 lg:col-span-3'>
            <MineSistDokumenterte
              etterlevelseDokumentasjoner={data?.etterlevelseDokumentasjoner.content}
              loading={etterlevelseDokumentasjonLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
