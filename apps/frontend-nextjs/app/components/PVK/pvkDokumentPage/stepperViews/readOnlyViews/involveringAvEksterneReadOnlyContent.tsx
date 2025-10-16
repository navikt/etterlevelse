import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import {
  EPVK,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { BodyLong, Heading, Label, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  personkategorier: string[]
  databehandlere: string[]
  pvkDokument: IPvkDokument
}

export const InvolveringAvEksterneReadOnlyContent: FunctionComponent<TProps> = ({
  personkategorier,
  databehandlere,
  pvkDokument,
}) => {
  return (
    <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
      <div className='flex justify-center'>
        <div>
          <Heading level='1' size='medium' className='mb-5'>
            Involvering av eksterne deltakere
          </Heading>

          <Heading level='2' size='small' className='mb-3'>
            Representanter for de registrerte
          </Heading>

          <List className='mt-5'>
            <Label size='medium'>{EPVK.behandlingAvPersonopplysninger}</Label>
            {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
            {personkategorier.length > 0 &&
              personkategorier.map((personkategori) => (
                <List.Item key={personkategori}>{personkategori}</List.Item>
              ))}
          </List>

          <div className='mt-5 mb-3 max-w-[75ch]'>
            <Label>1. Har dere involvert en representant for de registrerte?</Label>
            <DataTextWrapper>
              {pvkDokument.harInvolvertRepresentant === null && 'Ikke besvart'}
              {pvkDokument.harInvolvertRepresentant === true && 'Ja'}
              {pvkDokument.harInvolvertRepresentant === false && 'Nei'}
            </DataTextWrapper>
          </div>

          <div className='mt-5 mb-3 max-w-[75ch]'>
            <Label>2. Utdyp hvordan dere har involvert representant(er) for de registrerte</Label>
            <DataTextWrapper>{pvkDokument.representantInvolveringsBeskrivelse}</DataTextWrapper>
          </div>

          <List className='mt-10'>
            <Heading size='medium'>Representanter for databehandlere</Heading>
            <BodyLong>
              I Behandlingskatalogen står det at følgende databehandlere benyttes:
            </BodyLong>
            {databehandlere.length === 0 && <List.Item>Ingen</List.Item>}
            {databehandlere.length > 0 &&
              databehandlere.map((databehandler) => (
                <List.Item key={databehandler}>{databehandler}</List.Item>
              ))}
          </List>

          <div className='mt-5 mb-3 max-w-[75ch]'>
            <Label>3. Har dere involvert en representant for databehandlere?</Label>
            <DataTextWrapper>
              {pvkDokument.harDatabehandlerRepresentantInvolvering === null && 'Ingen svar'}
              {pvkDokument.harDatabehandlerRepresentantInvolvering === true && 'Ja'}
              {pvkDokument.harDatabehandlerRepresentantInvolvering === false && 'Nei'}
            </DataTextWrapper>
          </div>

          <div className='mt-5 mb-3 max-w-[75ch]'>
            <Label>4. Utdyp hvordan dere har involvert representant(er) for databehandler(e)</Label>
            <DataTextWrapper>
              {pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse}
            </DataTextWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvolveringAvEksterneReadOnlyContent
