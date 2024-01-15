import { Heading } from '@navikt/ds-react'
import { PageLayout } from '../components/scaffold/Page'
import notFound from '../resources/notfound.svg'
import { ampli } from '../services/Amplitude'
import { intl } from '../util/intl/intl'

const Forbidden = () => {
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
