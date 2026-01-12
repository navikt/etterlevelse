import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import EndringerGjortSidenSisteInnsending from '@/components/pvoTilbakemelding/common/EndringerGjortSidenSisteInnsending'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { EPVK } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Heading, Label, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  artOgOmfang: IBehandlingensArtOgOmfang
  personkategorier: string[]
  isChangesMadeSinceLastSubmission?: boolean
}

export const ArtOgOmfangReadOnlyContent: FunctionComponent<TProps> = ({
  artOgOmfang,
  personkategorier,
  isChangesMadeSinceLastSubmission,
}) => {
  return (
    <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
      <div className='flex justify-center'>
        <div>
          <Heading level='1' size='medium' className='mb-5'>
            Behandlingens art og omfang
          </Heading>

          {isChangesMadeSinceLastSubmission && <EndringerGjortSidenSisteInnsending />}

          <List>
            <Label>{EPVK.behandlingAvPersonopplysninger}</Label>
            {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
            {personkategorier.length > 0 &&
              personkategorier.map((personkategori) => (
                <List.Item key={personkategori}>{personkategori}</List.Item>
              ))}
          </List>

          <div className='pt-5 pb-3 max-w-[75ch]'>
            <Label>1. Stemmer denne lista over personkategorier?</Label>
            <DataTextWrapper>
              {artOgOmfang.stemmerPersonkategorier === null && 'Ikke besvart'}
              {artOgOmfang.stemmerPersonkategorier === true && 'Ja'}
              {artOgOmfang.stemmerPersonkategorier === false && 'Nei'}
            </DataTextWrapper>
          </div>

          <div className='pt-5 pb-3 max-w-[75ch]'>
            <Label>
              2. For hver av personkategoriene over, beskriv hvor mange personer dere behandler
              personopplysninger om.
            </Label>
            <DataTextWrapper>{artOgOmfang.personkategoriAntallBeskrivelse}</DataTextWrapper>
          </div>

          <div className='pt-5 pb-3 max-w-[75ch]'>
            <Label>
              3. Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av
              rollene, beskriv hvor mange som har tilgang.
            </Label>
            <DataTextWrapper>{artOgOmfang.tilgangsBeskrivelsePersonopplysningene}</DataTextWrapper>
          </div>

          <div className='pt-5 pb-3 max-w-[75ch]'>
            <Label>4. Beskriv hvordan og hvor lenge personopplysningene skal lagres.</Label>
            <DataTextWrapper>{artOgOmfang.lagringsBeskrivelsePersonopplysningene}</DataTextWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtOgOmfangReadOnlyContent
