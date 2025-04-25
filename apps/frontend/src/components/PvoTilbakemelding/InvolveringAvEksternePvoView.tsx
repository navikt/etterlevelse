import { BodyLong, Heading, Label, List } from '@navikt/ds-react'
import { FunctionComponent, RefObject } from 'react'
import { IPvkDokument, IPvoTilbakemelding } from '../../constants'
import DataTextWrapper from './common/DataTextWrapper'
import PvoSidePanelWrapper from './common/PvoSidePanelWrapper'
import PvoFormButtons from './edit/PvoFormButtons'
import PvoTilbakemeldingForm from './edit/PvoTilbakemeldingForm'

type TProps = {
  personkategorier: string[]
  databehandlere: string[]
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const InvolveringAvEksternePvoView: FunctionComponent<TProps> = ({
  personkategorier,
  databehandlere,
  pvkDokument,
  pvoTilbakemelding,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
}) => (
  <div className='w-full'>
    <div className='flex w-full'>
      <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
        <div className='flex justify-center'>
          <div>
            <Heading level='1' size='medium' className='mb-5'>
              Involvering av eksterne deltakere
            </Heading>

            <Heading level='2' size='small' className='mb-3'>
              Representanter for de registrerte
            </Heading>

            <List
              size='medium'
              className='mt-5'
              headingTag='label'
              title='I Behandlingskatalogen står det at dere behandler personopplysninger om:'
            >
              {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
              {personkategorier.length > 0 &&
                personkategorier.map((personkategori) => (
                  <List.Item key={personkategori}>{personkategori}</List.Item>
                ))}
            </List>

            <div className='mt-5 mb-3 max-w-[75ch]'>
              <Label>Har dere involvert en representant for de registrerte?</Label>
              <DataTextWrapper>
                {pvkDokument.harInvolvertRepresentant === null && 'Ikke besvart'}
                {pvkDokument.harInvolvertRepresentant === true && 'Ja'}
                {pvkDokument.harInvolvertRepresentant === false && 'Nei'}
              </DataTextWrapper>
            </div>

            <div className='mt-5 mb-3 max-w-[75ch]'>
              <Label>Utdyp hvordan dere har involvert representant(er) for de registrerte</Label>
              <DataTextWrapper>{pvkDokument.representantInvolveringsBeskrivelse}</DataTextWrapper>
            </div>

            <List className='mt-10' title='Representanter for databehandlere'>
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
              <Label>Har dere involvert en representant for databehandlere?</Label>
              <DataTextWrapper>
                {pvkDokument.harDatabehandlerRepresentantInvolvering === null && 'Ingen svar'}
                {pvkDokument.harDatabehandlerRepresentantInvolvering === true && 'Ja'}
                {pvkDokument.harDatabehandlerRepresentantInvolvering === false && 'Nei'}
              </DataTextWrapper>
            </div>

            <div className='mt-5 mb-3 max-w-[75ch]'>
              <Label>Utdyp hvordan dere har involvert representant(er) for databehandler(e)</Label>
              <DataTextWrapper>
                {pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse}
              </DataTextWrapper>
            </div>
          </div>
        </div>
      </div>
      {/* PVO sidepanel */}
      <PvoSidePanelWrapper>
        <PvoTilbakemeldingForm
          pvkDokumentId={pvkDokument.id}
          fieldName='innvolveringAvEksterne'
          initialValue={pvoTilbakemelding.innvolveringAvEksterne}
          formRef={formRef}
        />
      </PvoSidePanelWrapper>
    </div>
    <PvoFormButtons
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      setSelectedStep={setSelectedStep}
      submitForm={formRef.current?.submitForm}
    />
  </div>
)

export default InvolveringAvEksternePvoView
