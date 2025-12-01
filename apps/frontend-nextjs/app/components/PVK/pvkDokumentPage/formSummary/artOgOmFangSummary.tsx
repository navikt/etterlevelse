import BodyLongWithLineBreak from '@/components/common/bodyLongWithLineBreak'
import {
  IArtOgOmfangError,
  IBehandlingensArtOgOmfang,
} from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { EPVK } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { BodyLong, FormSummary, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { StepTitle } from '../pvkDokumentPage'
import FormAlert from './formAlert'

type TProps = {
  artOgOmfang: IBehandlingensArtOgOmfang
  artOgOmfangError: IArtOgOmfangError
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  customLinktext?: string
  customStepNumber?: number
}

export const ArtOgOmFangSummary: FunctionComponent<TProps> = ({
  artOgOmfang,
  artOgOmfangError,
  updateTitleUrlAndStep,
  personkategorier,
  customLinktext,
  customStepNumber,
}) => (
  <FormSummary className='my-3'>
    <FormSummary.Header>
      <FormSummary.Heading level='2'>{StepTitle[2]}</FormSummary.Heading>
      <FormSummary.EditLink
        className='cursor-pointer'
        onClick={() => updateTitleUrlAndStep(customStepNumber ? customStepNumber : 3)}
        href={window.location.pathname + '?steg=' + `${customStepNumber ? customStepNumber : 3}`}
      >
        {customLinktext ? customLinktext : 'Endre svar'}
      </FormSummary.EditLink>
    </FormSummary.Header>
    <FormSummary.Answers>
      <FormSummary.Answer>
        <FormSummary.Value>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Label>{EPVK.behandlingAvPersonopplysninger}</FormSummary.Label>
              <FormSummary.Value>
                <List>
                  {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
                  {personkategorier.length > 0 &&
                    personkategorier.map((personkategori) => (
                      <List.Item key={personkategori}>{personkategori}</List.Item>
                    ))}
                </List>
              </FormSummary.Value>
            </FormSummary.Answer>
            <FormSummary.Answer>
              <FormSummary.Label id='stemmerPersonkategorier'>
                Stemmer disse personkategoriene?
              </FormSummary.Label>
              <FormSummary.Value>
                {!artOgOmfangError.stemmerPersonkategorier &&
                  (artOgOmfang.stemmerPersonkategorier === undefined ||
                    artOgOmfang.stemmerPersonkategorier === null) &&
                  'Ikke besvart'}
                {artOgOmfang.stemmerPersonkategorier === true && 'Ja'}
                {artOgOmfang.stemmerPersonkategorier === false && 'Nei'}
                {artOgOmfangError.stemmerPersonkategorier && (
                  <FormAlert>Dere må oppgi om lista over personkategorier stemmer.</FormAlert>
                )}
              </FormSummary.Value>
            </FormSummary.Answer>
          </FormSummary.Answers>
        </FormSummary.Value>
      </FormSummary.Answer>

      <FormSummary.Answer>
        <FormSummary.Value>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Label id='personkategoriAntallBeskrivelse'>
                Beskriv antall personer dere behandler personopplysninger om
              </FormSummary.Label>
              <FormSummary.Value>
                {artOgOmfang.personkategoriAntallBeskrivelse && (
                  <BodyLongWithLineBreak>
                    {artOgOmfang.personkategoriAntallBeskrivelse}
                  </BodyLongWithLineBreak>
                )}
                {!artOgOmfangError.personkategoriAntallBeskrivelse &&
                  !artOgOmfang.personkategoriAntallBeskrivelse && <BodyLong>Ikke besvart</BodyLong>}
                {artOgOmfangError.personkategoriAntallBeskrivelse && (
                  <FormAlert>
                    Dere må beskrive hvor mange personer dere behandler personopplysninger om.
                  </FormAlert>
                )}
              </FormSummary.Value>
            </FormSummary.Answer>
          </FormSummary.Answers>
        </FormSummary.Value>
      </FormSummary.Answer>

      <FormSummary.Answer>
        <FormSummary.Value>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Label id='tilgangsBeskrivelsePersonopplysningene'>
                Beskriv hvilke roller som skal ha tilgang
              </FormSummary.Label>
              <FormSummary.Value>
                {artOgOmfang.tilgangsBeskrivelsePersonopplysningene && (
                  <BodyLongWithLineBreak>
                    {artOgOmfang.tilgangsBeskrivelsePersonopplysningene}
                  </BodyLongWithLineBreak>
                )}
                {!artOgOmfangError.tilgangsBeskrivelsePersonopplysningene &&
                  !artOgOmfang.tilgangsBeskrivelsePersonopplysningene && (
                    <BodyLong>Ikke besvart</BodyLong>
                  )}
                {artOgOmfangError.tilgangsBeskrivelsePersonopplysningene && (
                  <FormAlert>
                    Dere må beskrive hvilke roller som skal ha tilgang til personopplysningene, og
                    pr. rolle, hvor mange som skal ha tilgang til hva.
                  </FormAlert>
                )}
              </FormSummary.Value>
            </FormSummary.Answer>
          </FormSummary.Answers>
        </FormSummary.Value>
      </FormSummary.Answer>

      <FormSummary.Answer>
        <FormSummary.Value>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Label id='lagringsBeskrivelsePersonopplysningene'>
                Beskriv hvordan og hvor lenge personopplysningene skal lagres
              </FormSummary.Label>
              <FormSummary.Value>
                {artOgOmfang.lagringsBeskrivelsePersonopplysningene && (
                  <BodyLongWithLineBreak>
                    {artOgOmfang.lagringsBeskrivelsePersonopplysningene}
                  </BodyLongWithLineBreak>
                )}
                {!artOgOmfangError.lagringsBeskrivelsePersonopplysningene &&
                  !artOgOmfang.lagringsBeskrivelsePersonopplysningene && (
                    <BodyLong>Ikke besvart</BodyLong>
                  )}
                {artOgOmfangError.lagringsBeskrivelsePersonopplysningene && (
                  <FormAlert>
                    Dere må beskrive hvordan og hvor lenge personopplysningene skal lagres.
                  </FormAlert>
                )}
              </FormSummary.Value>
            </FormSummary.Answer>
          </FormSummary.Answers>
        </FormSummary.Value>
      </FormSummary.Answer>
    </FormSummary.Answers>
  </FormSummary>
)

export default ArtOgOmFangSummary
