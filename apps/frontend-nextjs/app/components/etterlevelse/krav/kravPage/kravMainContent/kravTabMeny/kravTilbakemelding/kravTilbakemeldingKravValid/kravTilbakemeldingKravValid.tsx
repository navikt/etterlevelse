'use client'

import { TilbakemeldingNyModal } from '@/components/etterlevelse/tilbakemeldingNyModal/tilbakemeldingNyModal'
import { LoginButton } from '@/components/others/layout/header/login/login'
import { IKrav, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { ITilbakemelding } from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { hasKravExpired } from '@/util/hasKravExpired/hasKravExpired'
import { BodyLong, BodyShort, Button, Heading } from '@navikt/ds-react'
import { FunctionComponent, useContext, useState } from 'react'

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
  const { isLoggedIn, canWrite } = useContext(UserContext)
  const getKravExpired: boolean = hasKravExpired(alleKravVersjoner, krav as TKravQL | undefined)

  return (
    <>
      {!getKravExpired && (
        <div>
          <div className='mt-10'>
            <Heading size='medium' level='1'>
              Spørsmål til kraveier
            </Heading>
            {isLoggedIn() && (
              <BodyLong className='max-w-xl'>
                Her kan du stille kraveier et spørsmål dersom det er uklarheter vedrørende hvordan
                kravet skal forstås. Spørsmål og svar fra kraveier blir synlig for alle på denne
                siden.
              </BodyLong>
            )}
            {!isLoggedIn() && (
              <BodyShort>
                Du må være innlogget for å stille kraveier et spørsmål, og for å se tidligere
                spørsmål og svar.
              </BodyShort>
            )}

            {canWrite() && (
              <Button onClick={() => setAddTilbakemelding(true)}>Still et spørsmål</Button>
            )}
            {!isLoggedIn() && <LoginButton />}
          </div>

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
        </div>
      )}
    </>
  )
}
