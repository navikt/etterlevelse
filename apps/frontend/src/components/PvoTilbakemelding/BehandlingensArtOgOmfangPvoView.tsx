import { Heading, Label, List } from '@navikt/ds-react'
import { FunctionComponent, RefObject } from 'react'
import { EPVK, EPvoTilbakemeldingStatus, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import { ContentLayout } from '../layout/layout'
import DataTextWrapper from './common/DataTextWrapper'
import PvoSidePanelWrapper from './common/PvoSidePanelWrapper'
import PvoTilbakemeldingReadOnly from './common/PvoTilbakemeldingReadOnly'
import PvoFormButtons from './edit/PvoFormButtons'
import PvoTilbakemeldingForm from './edit/PvoTilbakemeldingForm'

type TProps = {
  personkategorier: string[]
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const BehandlingensArtOgOmfangPvoView: FunctionComponent<TProps> = ({
  personkategorier,
  pvkDokument,
  pvoTilbakemelding,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
}) => (
  <div className='w-full'>
    <ContentLayout>
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
              <Label>Stemmer denne lista over personkategorier?</Label>
              <DataTextWrapper>
                {pvkDokument.stemmerPersonkategorier === null && 'Ikke besvart'}
                {pvkDokument.stemmerPersonkategorier === true && 'Ja'}
                {pvkDokument.stemmerPersonkategorier === false && 'Nei'}
              </DataTextWrapper>
            </div>

            <div className='pt-5 pb-3 max-w-[75ch]'>
              <Label>
                For hver av personkategoriene over, beskriv hvor mange personer dere behandler
                personopplysninger om.
              </Label>
              <DataTextWrapper>{pvkDokument.personkategoriAntallBeskrivelse}</DataTextWrapper>
            </div>

            <div className='pt-5 pb-3 max-w-[75ch]'>
              <Label>
                Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av
                rollene, beskriv hvor mange som har tilgang.
              </Label>
              <DataTextWrapper>
                {pvkDokument.tilgangsBeskrivelsePersonopplysningene}
              </DataTextWrapper>
            </div>

            <div className='pt-5 pb-3 max-w-[75ch]'>
              <Label>Beskriv hvordan og hvor lenge personopplysningene skal lagres.</Label>
              <DataTextWrapper>
                {pvkDokument.lagringsBeskrivelsePersonopplysningene}
              </DataTextWrapper>
            </div>
          </div>
        </div>
      </div>

      {/* PVO sidepanel */}
      <PvoSidePanelWrapper>
        {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
          <PvoTilbakemeldingReadOnly
            tilbakemeldingsinnhold={pvoTilbakemelding.behandlingensArtOgOmfang}
            sentDate={pvoTilbakemelding.sendtDato}
            forPvo={true}
          />
        )}
        {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
          <PvoTilbakemeldingForm
            pvkDokumentId={pvkDokument.id}
            fieldName='behandlingensArtOgOmfang'
            initialValue={pvoTilbakemelding.behandlingensArtOgOmfang}
            formRef={formRef}
          />
        )}
      </PvoSidePanelWrapper>
    </ContentLayout>
    <PvoFormButtons
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      setSelectedStep={setSelectedStep}
      submitForm={formRef.current?.submitForm}
    />
  </div>
)

export default BehandlingensArtOgOmfangPvoView
