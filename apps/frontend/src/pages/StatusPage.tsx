import * as React from 'react'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import {BodyLong, Heading} from "@navikt/ds-react";

export const StatusPage = () => {
  ampli.logEvent('sidevisning', { side: 'Status side', sidetittel: 'Status i organisasjonen' })

  return (
    <div className="w-full pb-52" role="main" id="content" >
      <Helmet>
        <meta charSet="utf-8" />
        <title>Status i organisasjonen</title>
      </Helmet>
      <div className="w-full flex">
        <div className="max-w-7xl pl-48">
          <div className="pt-6">
            <CustomizedBreadcrumbs currentPage="Status i organisasjonene" />
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <div className="max-w-7xl flex justify-center">
          <div className="max-w-3xl">

            <Heading size="large" className="mt-14 mb-8">
              Status i organisasjonen
            </Heading>

            <BodyLong size="large" className="mt-0" >
              Vi jobber med å få på plass nyttig statistikk og oversikter over etterlevels Har du innspill hører vi gjerne fra deg på <strong>#etterlevelse</strong>.
            </BodyLong>
          </div>
        </div>
      </div>
    </div>
  )
}
