import { PageLayout } from '@/components/others/scaffold/scaffold'
import notFound from '@/resources/notfound.svg'
import { Heading } from '@navikt/ds-react'
import Image from 'next/image'

const Forbidden = () => {
  // ampli.logEvent('sidevisning', { side: 'Forbidden', sidetittel: '403 forbidden' })

  return (
    <PageLayout pageTitle='403 forbidden'>
      <div className='pl-10 pr-10'>
        <Heading className='pt-10 pb-10' size='medium' level='1'>
          Du prøvde å komme inn i en side du ikke har tilgang til.
        </Heading>
        <Image
          src={notFound}
          alt='Oida 404! Fant ikke den siden der nei'
          style={{ maxWidth: '65%' }}
        />
      </div>
    </PageLayout>
  )
}

export default Forbidden
