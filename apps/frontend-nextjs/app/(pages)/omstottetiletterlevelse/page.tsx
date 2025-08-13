'use client'

import { getMeldingByType, mapMeldingToFormValue } from '@/api/melding/meldingApi'
import { Markdown } from '@/components/common/markdown/markdown'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { EMeldingType, IMelding } from '@/constants/admin/message/messageConstants'
import { IPageResponse } from '@/constants/commonConstants'
import { ampli, userRoleEventProp } from '@/services/amplitude/amplitudeService'
import { user } from '@/services/user/userService'
import { BodyLong, Detail, Heading } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'

const OmStotteTilEtterlevelse = () => {
  const [melding, setMelding] = useState<IMelding>()

  useEffect(() => {
    ;(async () => {
      const response: IPageResponse<IMelding> = await getMeldingByType(EMeldingType.OM_ETTERLEVELSE)
      if (response.numberOfElements > 0) {
        setMelding(response.content[0])
      } else {
        setMelding(mapMeldingToFormValue({ meldingType: EMeldingType.OM_ETTERLEVELSE }))
      }
    })()
  }, [])

  useEffect(() => {
    ampli().logEvent('sidevisning', {
      side: 'FAQ side',
      sidetittel: 'Om Støtte til etterlevelse',
      ...userRoleEventProp,
    })
  }, [])

  /* eslint-disable jsx-a11y/media-has-caption */
  return (
    <PageLayout pageTitle='Om Støtte til etterlevelse' currentPage='Om Støtte til etterlevelse'>
      <div>
        <video controls src='videos/EtterlevelseskravMedTeksting.mp4'></video>
      </div>

      <div className='flex justify-center w-full'>
        <div>
          <div className='mb-5'>
            <Heading size='medium' level='1' className='mt-14 mb-8'>
              Om Støtte til etterlevelse
            </Heading>

            <BodyLong className='mt-0'>{melding?.melding}</BodyLong>
          </div>

          <div>
            {melding?.secondaryTittel && (
              <Heading level='2' size='small' className='mt-14 mb-6'>
                {melding?.secondaryTittel}
              </Heading>
            )}
            <Markdown source={melding?.secondaryMelding} />

            <div className='mt-20'>
              {user.isAdmin() && melding && (
                <Detail>
                  Sist endret: {moment(melding.changeStamp.lastModifiedDate).format('LL')} av{' '}
                  {melding.changeStamp.lastModifiedBy.split('-')[1]}
                </Detail>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default OmStotteTilEtterlevelse
