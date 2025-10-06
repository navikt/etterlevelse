import { LoadingSkeleton } from '@/components/common/loadingSkeleton/loadingSkeletonComponent'
import StatusTag from '@/components/common/statusTag/statusTagComponent'
import { TKravQL } from '@/constants/krav/kravConstants'
import { kravNummerView } from '@/util/krav/kravUtil'
import { InformationSquareIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Heading } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  kravLoading: boolean
  krav: TKravQL | undefined
}

export const KravOverview: FunctionComponent<TProps> = ({ kravLoading, krav }) => (
  <>
    {kravLoading && <LoadingSkeleton header='Krav' />}
    {!kravLoading && (
      <div className='flex w-full pb-8'>
        <div className='flex flex-col w-full'>
          <div className='w-full'>
            <BodyShort>
              {krav && krav.kravNummer !== 0
                ? kravNummerView(krav.kravVersjon, krav.kravNummer)
                : 'Ny'}
            </BodyShort>

            <Heading className='mb-3' size='medium' level='1'>
              {krav?.navn ? krav.navn : 'Ny'}
            </Heading>

            {krav && <StatusTag status={krav.status} />}

            {krav?.varselMelding && (
              <div className='w-fit flex justify-center items-center mt-5'>
                <InformationSquareIcon fontSize='1.5rem' />
                <BodyLong className='ml-1'>{krav.varselMelding}</BodyLong>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </>
)
