'use client'

import { Button, Heading, Link } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'
import { type TConsentValue } from '@/util/analytics/umami'
import { useConsent } from '@/util/analytics/useConsent'

const CookieConsentBanner: FunctionComponent = () => {
  const { consent, setConsent } = useConsent()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleConsent = (value: TConsentValue) => {
    setConsent(value)
  }

  if (!isMounted || consent !== '') {
    return null
  }

  return (
    <div className='sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm'>
      <div className='mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between'>
        <div className='max-w-3xl'>
          <Heading level='2' size='small'>
            Informasjonskapsler og analyse
          </Heading>
          <div className='mt-1 text-sm text-gray-700'>
            Vi bruker informasjonskapsler for å forbedre opplevelsen og samle statistikk om hvordan
            løsningen brukes. Du kan lese mer om dette i{' '}
            <Link href='/om-personvernerklaering'>personvernerklæringen</Link>.
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button variant='secondary' onClick={() => handleConsent('rejected')}>
            Avvis
          </Button>
          <Button onClick={() => handleConsent('accepted')}>Godta</Button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsentBanner
