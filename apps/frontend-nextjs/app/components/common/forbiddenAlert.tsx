import alertGif from '@/resources/no_no_no.webp'
import { Alert } from '@navikt/ds-react'
import Image from 'next/image'

export const ForbiddenAlert = () => (
  <div className='flex w-full justify-center mt-5'>
    <div className='flex items-center flex-col gap-5'>
      <Alert variant='warning'>Du har ikke tilgang til å redigere på PVK dokument.</Alert>

      <Image src={alertGif} alt='no no no' width='400' />
    </div>
  </div>
)

export default ForbiddenAlert
