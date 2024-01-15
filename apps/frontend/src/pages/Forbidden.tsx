import { Heading } from '@navikt/ds-react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageLayout } from '../components/scaffold/Page'
import notFound from '../resources/notfound.svg'
import { ampli } from '../services/Amplitude'
import { user } from '../services/User'
import { intl } from '../util/intl/intl'

const Forbidden = () => {
  const params = useParams<{ role?: string }>()

  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => {
      if (user.isLoggedIn()) {
        if (params.role === 'admin' && user.isAdmin()) {
          navigate(-1)
        } else if (params.role === 'kraveier' && (user.isKraveier() || user.isAdmin())) {
          navigate(-1)
        }
      }
    }, 1000)
  }, [user])

  ampli.logEvent('sidevisning', { side: 'Forbidden', sidetittel: '403 forbidden' })

  return (
    <PageLayout pageTitle="403 forbidden">
      <div className="pl-10 pr-10">
        <Heading className="pt-10 pb-10" size="medium" level="1">
          Du prøvde å komme inn i en side du ikke har tilgang til.
        </Heading>
        <img src={notFound} alt={intl.pageNotFound} style={{ maxWidth: '65%' }} />
      </div>
    </PageLayout>
  )
}

export default Forbidden
