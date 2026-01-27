import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { BodyLong, Heading, Label, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { BeskjedFraEtterleverReadOnly } from './beskjedFraEtterleverReadOnly'

type TProps = {
  pvkDokument: IPvkDokument
  relevantVurdering: IVurdering
  pvoVurderingList: ICode[]
  headingLevel?: '1' | '2' | '3' | '4' | '5' | '6'
  headingSize?: 'small' | 'medium' | 'xlarge' | 'large' | 'xsmall'
}

export const SendInnPvoReadOnly: FunctionComponent<TProps> = ({
  pvkDokument,
  relevantVurdering,
  pvoVurderingList,
  headingLevel,
  headingSize,
}) => {
  const getPvoVurdering = () => {
    const vurderingen = pvoVurderingList.filter(
      (vurdering) => vurdering.code === relevantVurdering.pvoVurdering
    )
    if (vurderingen.length === 0) {
      return ''
    } else {
      return vurderingen[0].description
    }
  }
  return (
    <div>
      <BeskjedFraEtterleverReadOnly
        pvkDokument={pvkDokument}
        innsendingId={relevantVurdering.innsendingId}
      />

      <Heading
        level={headingLevel ? headingLevel : '1'}
        size={headingSize ? headingSize : 'medium'}
        className='mb-5'
      >
        PVOs interne diskusjon
      </Heading>

      <DataTextWrapper>
        {relevantVurdering.internDiskusjon && relevantVurdering.internDiskusjon.length !== 0 && (
          <Markdown source={relevantVurdering.internDiskusjon} />
        )}
        <BodyLong>
          {(!relevantVurdering.internDiskusjon || relevantVurdering.internDiskusjon.length === 0) &&
            'Ingen intern diskusjon'}
        </BodyLong>
      </DataTextWrapper>

      <Heading
        level={headingLevel ? headingLevel : '1'}
        size={headingSize ? headingSize : 'medium'}
        className='mb-5'
      >
        Tilbakemelding til etterlever
      </Heading>

      <div className='mt-5 mb-3 max-w-[75ch]'>
        <div className='mb-3'>
          <Label>Beskjed til etterlever</Label>
          <DataTextWrapper>
            {relevantVurdering.merknadTilEtterleverEllerRisikoeier &&
              relevantVurdering.merknadTilEtterleverEllerRisikoeier.length !== 0 && (
                <Markdown source={relevantVurdering.merknadTilEtterleverEllerRisikoeier} />
              )}
            <BodyLong>
              {(!relevantVurdering.merknadTilEtterleverEllerRisikoeier ||
                relevantVurdering.merknadTilEtterleverEllerRisikoeier.length === 0) &&
                'Ingen tilbakemelding til etterlever'}
            </BodyLong>
          </DataTextWrapper>
        </div>

        <div className='mb-3'>
          <Label>Anbefales det at arbeidet går videre som planlagt?</Label>
          <DataTextWrapper>
            {relevantVurdering.arbeidGarVidere === null
              ? null
              : relevantVurdering.arbeidGarVidere === true
                ? 'Ja'
                : 'Nei'}
          </DataTextWrapper>
        </div>

        <div className='mb-3'>
          <Label>Beskriv anbefalingen nærmere:</Label>
          <DataTextWrapper customEmptyMessage='Ingen beskrivelse'>
            {relevantVurdering.arbeidGarVidereBegrunnelse}
          </DataTextWrapper>
        </div>

        <div className='mb-3'>
          <Label>Er det behov for forhåndskonsultasjon med Datatilsynet?</Label>
          <DataTextWrapper>
            {relevantVurdering.behovForForhandskonsultasjon === null
              ? null
              : relevantVurdering.behovForForhandskonsultasjon === true
                ? 'Ja'
                : 'Nei'}
          </DataTextWrapper>
        </div>

        <div className='mb-3'>
          <Label>Beskriv anbefalingen nærmere:</Label>
          <DataTextWrapper customEmptyMessage='Ingen beskrivelse'>
            {relevantVurdering.behovForForhandskonsultasjonBegrunnelse}
          </DataTextWrapper>
        </div>

        <div className='mb-3'>
          <Label>Personvernombudets vurdering</Label>
          <DataTextWrapper>
            {getPvoVurdering()}

            {(relevantVurdering.pvoFolgeOppEndringer || relevantVurdering.vilFaPvkIRetur) && (
              <List>
                {relevantVurdering.pvoFolgeOppEndringer && (
                  <List.Item>PVO vil følge opp endringer dere gjør.</List.Item>
                )}
                {relevantVurdering.vilFaPvkIRetur && (
                  <List.Item>
                    PVO vil få PVK i retur etter at dere har gjennomgått tilbakemeldinger.
                  </List.Item>
                )}
              </List>
            )}
          </DataTextWrapper>
        </div>
      </div>
    </div>
  )
}
