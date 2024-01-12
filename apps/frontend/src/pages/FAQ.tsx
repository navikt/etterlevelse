import { BodyLong, Detail, Heading } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { getMeldingByType, mapMeldingToFormValue } from '../api/MeldingApi'
import { Markdown } from '../components/common/Markdown'
import { PageLayout } from '../components/scaffold/Page'
import { EMeldingType, IMelding } from '../constants'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { user } from '../services/User'

export const FAQ = () => {
  const [melding, setMelding] = useState<IMelding>()

  useEffect(() => {
    ;(async () => {
      const response = await getMeldingByType(EMeldingType.OM_ETTERLEVELSE)
      if (response.numberOfElements > 0) {
        setMelding(response.content[0])
      } else {
        setMelding(mapMeldingToFormValue({ meldingType: EMeldingType.OM_ETTERLEVELSE }))
      }
    })()
  }, [])

  ampli.logEvent('sidevisning', {
    side: 'FAQ side',
    sidetittel: 'Om Støtte til etterlevelse',
    ...userRoleEventProp,
  })

  return (
    <PageLayout pageTitle="Om Støtte til etterlevelse" currentPage="Om Støtte til etterlevelse">
      <div className="flex justify-center w-full">
        <div>
          <div className="max-w-4xl">
            <Heading size="medium" level="1" className="mt-14 mb-8">
              Om Støtte til etterlevelse
            </Heading>

            <BodyLong className="mt-0">{melding?.melding}</BodyLong>
          </div>

          <div className="max-w-xl">
            <Heading level="2" size="small" className="mt-14 mb-6">
              {melding?.secondaryTittel}
            </Heading>
            <Markdown source={melding?.secondaryMelding} />

            <div className="mt-20">
              {user.isAdmin() && melding && (
                <Detail>
                  Sist endret: {moment(melding.changeStamp.lastModifiedDate).format('ll')} av{' '}
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
