'use client'

import { TilbakemeldingNyModal } from '@/components/etterlevelse/tilbakemeldingNyModal/tilbakemeldingNyModal'
import { IKrav, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { ITilbakemelding } from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { hasKravExpired } from '@/util/krav/kravUtil'
import { BodyLong, Button, Heading } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'

type TProps = {
  krav: IKrav
  alleKravVersjoner: IKravVersjon[]
  add: (tilbakemelding: ITilbakemelding) => void
}

export const KravTilbakemeldingKravValid: FunctionComponent<TProps> = ({
  alleKravVersjoner,
  krav,
  add,
}) => {
  const [addTilbakemelding, setAddTilbakemelding] = useState(false)
  const getKravExpired: boolean = hasKravExpired(alleKravVersjoner, krav as TKravQL | undefined)

  return (
    <>
      {!getKravExpired && (
        <div>
          <div className='mt-10'>
            <Heading size='medium' level='1'>
              Spørsmål til kraveier
            </Heading>

            <BodyLong className='max-w-xl'>
              Her kan du stille kraveier et spørsmål dersom det er uklarheter vedrørende hvordan
              kravet skal forstås. Spørsmål og svar fra kraveier blir synlig for alle på denne
              siden.
            </BodyLong>

            <Button onClick={() => setAddTilbakemelding(true)}>Still et spørsmål</Button>
          </div>

          {addTilbakemelding && (
            <TilbakemeldingNyModal
              krav={krav}
              open={addTilbakemelding}
              close={(tilbakemelding: ITilbakemelding | undefined) => {
                if (tilbakemelding) {
                  add(tilbakemelding)
                }
                setAddTilbakemelding(false)
              }}
            />
          )}
        </div>
      )}
    </>
  )
}
