import { Heading } from '@navikt/ds-react'
import { useLocation } from 'react-router-dom'
import { PageLayout } from '../components/scaffold/Page'
import notFound from '../resources/notfound.svg'
import { ampli } from '../services/Amplitude'
import { intl } from '../util/intl/intl'

const NotFound = () => {
  const location = useLocation()

  ampli.logEvent('sidevisning', { side: 'NotFound', sidetittel: '404 not found' })

  return (
    <PageLayout pageTitle="404 not found">
      <div className="pl-10 pr-10">
        <Heading className="pt-10 pb-10" size="medium" level="1">
          {intl.pageNotFound} - {location.pathname}
        </Heading>
        <img src={notFound} alt={intl.pageNotFound} style={{ maxWidth: '65%' }} />
      </div>
    </PageLayout>
  )
}

export default NotFound
