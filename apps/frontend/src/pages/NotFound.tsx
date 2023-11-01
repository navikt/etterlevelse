import * as React from 'react'
import { useLocation } from 'react-router-dom'
import { intl } from '../util/intl/intl'
import notFound from '../resources/notfound.svg'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import {Heading} from '@navikt/ds-react'

const NotFound = () => {
  const location = useLocation()

  ampli.logEvent('sidevisning', { side: 'NotFound', sidetittel: '404 not found' })

  return (
    <div className="w-full" role="main" id="content">
      <Helmet>
        <meta charSet="utf-8" />
        <title>404 not found</title>
      </Helmet>
      <div className="pl-10 pr-10">
        <Heading className="pt-10 pb-10" size="medium">
          {intl.pageNotFound} - {location.pathname}
        </Heading>
        <img src={notFound} alt={intl.pageNotFound} style={{ maxWidth: '65%' }} />
      </div>
    </div>
  )
}

export default NotFound
