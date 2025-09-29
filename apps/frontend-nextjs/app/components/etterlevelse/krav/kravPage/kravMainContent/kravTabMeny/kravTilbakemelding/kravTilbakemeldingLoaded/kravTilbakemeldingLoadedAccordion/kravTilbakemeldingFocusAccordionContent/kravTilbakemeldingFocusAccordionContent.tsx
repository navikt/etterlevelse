'use client'

import { MeldingKnapper } from '@/components/etterlevelse/edit/meldingKnapper/meldingKnapper'
import EndretInfo from '@/components/etterlevelse/tilbakemeldingEditInfo/tilbakemeldingsEditInfo'
import TilbakemeldingResponseMelding from '@/components/etterlevelse/tilbakemeldingResponseMelding/tilbakemeldingResponseMelding'
import TilbakemeldingSvar from '@/components/etterlevelse/tilbakemeldingSvar/tilbakemeldingSvar'
import { ContentLayout } from '@/components/others/layout/content/content'
import {
  ITilbakemelding,
  ITilbakemeldingMelding,
} from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { BodyLong } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, SetStateAction, useContext } from 'react'

type TProps = {
  tilbakemelding: ITilbakemelding
  replace: (tilbakemelding: ITilbakemelding) => void
  remove: (tilbakemelding: ITilbakemelding) => void
  melderOrKraveier: boolean
  setFocusNr: Dispatch<SetStateAction<string | undefined>>
  ubesvartOgKraveier: boolean
}

export const KravTilbakemeldingFocusAccordionContent: FunctionComponent<TProps> = ({
  tilbakemelding,
  replace,
  remove,
  melderOrKraveier,
  setFocusNr,
  ubesvartOgKraveier,
}) => {
  const user = useContext(UserContext)
  return (
    <>
      <ContentLayout>
        <BodyLong>{tilbakemelding.meldinger[0].innhold}</BodyLong>
      </ContentLayout>

      <div className='flex w-full items-center mt-4'>
        {tilbakemelding.meldinger.length === 1 && (
          <MeldingKnapper
            marginLeft
            melding={tilbakemelding.meldinger[0]}
            tilbakemeldingId={tilbakemelding.id}
            oppdater={replace}
            remove={remove}
          />
        )}
        <EndretInfo melding={tilbakemelding.meldinger[0]} />
      </div>

      {/* meldingsliste */}
      <div className='flex flex-col mt-4'>
        {tilbakemelding.meldinger.slice(1).map((melding: ITilbakemeldingMelding) => (
          <TilbakemeldingResponseMelding
            key={melding.meldingNr}
            melding={melding}
            tilbakemelding={tilbakemelding}
            oppdater={replace}
            remove={remove}
          />
        ))}
      </div>

      {/* knapprad bunn */}
      {melderOrKraveier && user.canWrite() && (
        <TilbakemeldingSvar
          tilbakemelding={tilbakemelding}
          setFokusNummer={setFocusNr}
          ubesvartOgKraveier={ubesvartOgKraveier}
          close={(tilbakemelding: ITilbakemelding) => {
            if (tilbakemelding) {
              replace(tilbakemelding)
            }
          }}
          remove={remove}
          replace={replace}
        />
      )}
    </>
  )
}
