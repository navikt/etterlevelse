import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import {
  EPVK,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Heading, Label, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  personkategorier: string[]
}

export const ArtOgOmfangReadOnlyContent: FunctionComponent<TProps> = ({
  pvkDokument,
  personkategorier,
}) => {
  return (
    <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
      <div className='flex justify-center'>
        <div>
          <Heading level='1' size='medium' className='mb-5'>
            Behandlingens art og omfang
          </Heading>

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
              {pvkDokument.stemmerPersonkategorier === null && 'Ikke besvart'}
              {pvkDokument.stemmerPersonkategorier === true && 'Ja'}
              {pvkDokument.stemmerPersonkategorier === false && 'Nei'}
            </DataTextWrapper>
          </div>

          <div className='pt-5 pb-3 max-w-[75ch]'>
            <Label>
              2. For hver av personkategoriene over, beskriv hvor mange personer dere behandler
              personopplysninger om.
            </Label>
            <DataTextWrapper>{pvkDokument.personkategoriAntallBeskrivelse}</DataTextWrapper>
          </div>

          <div className='pt-5 pb-3 max-w-[75ch]'>
            <Label>
              3. Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av
              rollene, beskriv hvor mange som har tilgang.
            </Label>
            <DataTextWrapper>{pvkDokument.tilgangsBeskrivelsePersonopplysningene}</DataTextWrapper>
          </div>

          <div className='pt-5 pb-3 max-w-[75ch]'>
            <Label>4. Beskriv hvordan og hvor lenge personopplysningene skal lagres.</Label>
            <DataTextWrapper>{pvkDokument.lagringsBeskrivelsePersonopplysningene}</DataTextWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtOgOmfangReadOnlyContent
