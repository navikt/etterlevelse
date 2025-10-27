'use client'

import notFound from '@/resources/notfound.svg'
import { Heading } from '@navikt/ds-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { PageLayout } from './components/others/scaffold/scaffold'

const NotFound = () => {
  const pathName = usePathname()

  // ampli.logEvent('sidevisning', { side: 'NotFound', sidetittel: '404 not found' })

  return (
    <PageLayout pageTitle='404 not found'>
      <div className='pl-10 pr-10'>
        <Heading className='pt-10 pb-10' size='medium' level='1'>
          Oida 404! Fant ikke den siden der nei - {pathName}
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

export default NotFound
