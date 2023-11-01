import { useEffect, useState } from 'react'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import { Melding, MeldingType } from '../constants'
import { getMeldingByType, mapMeldingToFormValue } from '../api/MeldingApi'
import { Markdown } from '../components/common/Markdown'
import moment from 'moment'
import { user } from '../services/User'
import { BodyLong, Detail, Heading } from "@navikt/ds-react";

export const FAQ = () => {
  const [melding, setMelding] = useState<Melding>()

  useEffect(() => {
    ; (async () => {
      const response = await getMeldingByType(MeldingType.OM_ETTERLEVELSE)
      if (response.numberOfElements > 0) {
        setMelding(response.content[0])
      } else {
        setMelding(mapMeldingToFormValue({ meldingType: MeldingType.OM_ETTERLEVELSE }))
      }
    })()
  }, [])

  ampli.logEvent('sidevisning', { side: 'FAQ side', sidetittel: 'Om Støtte til etterlevelse' })

  return (
    <div className="w-full" id="content" role='main'>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Om Støtte til etterlevelse</title>
      </Helmet>
      <div className="w-full flex">
        <CustomizedBreadcrumbs currentPage="Om Støtte til etterlevelse" />
      </div>

      <div className="flex justify-center w-full">
        <div>
          <div className="max-w-4xl">
            <Heading size="medium" className="mt-14 mb-8">
              Om Støtte til etterlevelse
            </Heading>

            <BodyLong className="mt-0" >
              {melding?.melding}
            </BodyLong>
          </div>

          <div className="max-w-xl">
            <Heading  level="2" size="small" className="mt-14 mb-6">
              {melding?.secondaryTittel}
            </Heading>
            <Markdown source={melding?.secondaryMelding} />

            <div className="mt-20">
              {user.isAdmin() && melding && (
                <Detail>
                  Sist endret: {moment(melding.changeStamp.lastModifiedDate).format('ll')} av {melding.changeStamp.lastModifiedBy.split('-')[1]}
                </Detail>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
