import { Markdown } from '@/components/common/markdown/markdown'
import {
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FormSummary } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

interface IProp {
  pvkDokument?: IPvkDokument
}

export const GodkjenningAvRisikoeierPvkFormSummary: FunctionComponent<IProp> = ({
  pvkDokument,
}) => (
  <FormSummary.Answer>
    <FormSummary.Label>Behov for PVK</FormSummary.Label>
    <FormSummary.Value>
      <FormSummary.Answers>
        <FormSummary.Answer>
          <FormSummary.Label>Hvilken vurdering har dere kommet fram til?</FormSummary.Label>
          <FormSummary.Value>
            {pvkDokument === undefined ||
              (pvkDokument &&
                (pvkDokument.pvkVurdering === undefined ||
                  pvkDokument.pvkVurdering === EPvkVurdering.UNDEFINED) &&
                'Ingen vurdering')}
            {pvkDokument &&
              pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE &&
              'Vi skal gjennomføre en PVK'}
            {pvkDokument &&
              pvkDokument.pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE &&
              'Vi skal ikke gjennomføre PVK'}
          </FormSummary.Value>
        </FormSummary.Answer>
        <FormSummary.Answer>
          <FormSummary.Label>Begrunn vurderingen deres</FormSummary.Label>
          <FormSummary.Value>
            {pvkDokument && pvkDokument.pvkVurderingsBegrunnelse !== '' && (
              <Markdown source={pvkDokument.pvkVurderingsBegrunnelse} />
            )}
            {pvkDokument === undefined ||
              (pvkDokument && pvkDokument.pvkVurderingsBegrunnelse === '' && 'Ingen begrunnelse')}
          </FormSummary.Value>
        </FormSummary.Answer>
      </FormSummary.Answers>
    </FormSummary.Value>
  </FormSummary.Answer>
)
