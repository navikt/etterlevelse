import { Heading, Label, List } from '@navikt/ds-react'
import { RefObject } from 'react'
import { IPvkDokument, IPvoTilbakemelding } from '../../constants'
import DataTextWrapper from './common/DataTextWrapper'
import PvoSidePanelWrapper from './common/PvoSidePanelWrapper'
import PvoFormButtons from './edit/PvoFormButtons'
import PvoTilbakemeldingForm from './edit/PvoTilbakemeldingForm'

interface IProps {
  personkategorier: string[]
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const BehandlingensArtOgOmfangPvoView = (props: IProps) => {
  const {
    personkategorier,
    pvkDokument,
    pvoTilbakemelding,
    activeStep,
    setActiveStep,
    setSelectedStep,
    formRef,
  } = props

  return (
    <div className='w-full'>
      <div className='flex w-full'>
        <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
          <div className='flex justify-center'>
            <div>
              <Heading level='1' size='medium' className='mb-5'>
                Behandlingens art og omfang
              </Heading>

              <List
                headingTag='label'
                title='I Behandlingskatalogen står det at dere behandler personopplysninger om:'
              >
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
          <PvoTilbakemeldingForm
            pvkDokumentId={pvkDokument.id}
            fieldName='behandlingensArtOgOmfang'
            initialValue={pvoTilbakemelding.behandlingensArtOgOmfang}
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
}
export default BehandlingensArtOgOmfangPvoView
