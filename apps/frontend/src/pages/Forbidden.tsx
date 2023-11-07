import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { intl } from '../util/intl/intl'
import notFound from '../resources/notfound.svg'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import { user } from '../services/User'
import { Heading } from '@navikt/ds-react'

const Forbidden = () => {
  const params = useParams<{ role?: string }>()

  const navigate = useNavigate()

  setTimeout(() => {
    if (user.isLoggedIn()) {
      if (params.role === 'admin' && user.isAdmin()) {
        navigate(-1)
      } else if (params.role === 'kraveier' && (user.isKraveier() || user.isAdmin())) {
        navigate(-1)
      }
    }
  }, 500)

  ampli.logEvent('sidevisning', { side: 'Forbidden', sidetittel: '403 forbidden' })

  return (
    <div className="w-full" role="main" id="content">
      <Helmet>
        <meta charSet="utf-8" />
        <title>403 forbidden</title>
      </Helmet>
      <div className="pl-10 pr-10">
        <Heading className="pt-10 pb-10" size="medium" level="1">
          Du prøvde å komme inn i en side du ikke har tilgang til.
        </Heading>
        <img src={notFound} alt={intl.pageNotFound} style={{ maxWidth: '65%' }} />
      </div>
    </div>
  )
}

export default Forbidden
