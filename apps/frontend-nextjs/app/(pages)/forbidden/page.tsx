import { PageLayout } from '@/components/others/scaffold/scaffold'
import Image from 'next/image'

const Forbidden = () => {
  // ampli.logEvent('sidevisning', { side: 'Forbidden', sidetittel: '403 forbidden' })

  return (
    <PageLayout pageTitle='403 forbidden'>
      <div className='pl-10 pr-10 pt-10'>
        {/* <Heading className='pt-10 pb-10 text-center' size='medium' level='1'>
          Du prøvde å komme inn på en side du ikke har tilgang til.
        </Heading> */}
        <div>
          <Image src='/403-forbidden.png' alt='403 Forbidden' width={1536} height={1024} />
        </div>
      </div>
    </PageLayout>
  )
}

export default Forbidden
