import StatusTag from '@/components/common/statusTag/statusTagComponent'
import { InformationSquareIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Heading } from '@navikt/ds-react'

export const KravOverview = () => (
  <div className='flex w-full pb-8'>
    <div className='flex flex-col w-full'>
      <div className='w-full'>
        <BodyShort>KRAV</BodyShort>
        <Heading className='mb-3' size='medium' level='1'>
          KRAV
        </Heading>
        <StatusTag status='STATUS' />
        <div className='w-fit flex justify-center items-center mt-5'>
          <InformationSquareIcon fontSize='1.5rem' />
          <BodyLong className='ml-1'>VARSELMELDING</BodyLong>
        </div>
      </div>
    </div>
  </div>
)
