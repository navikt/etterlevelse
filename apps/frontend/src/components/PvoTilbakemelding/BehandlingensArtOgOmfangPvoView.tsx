import { BodyLong, Heading, Label, List } from '@navikt/ds-react'
import { RefObject } from 'react'
import { IPvkDokument, IPvoTilbakemelding } from '../../constants'
import FormButtons from '../PvkDokument/edit/FormButtons'
import PvoTilbakemeldingForm from './edit/PvoTilbakemeldingForm'

interface IProps {
  personkategorier: string[]
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjonId: string
  pvoTilbakemelding: IPvoTilbakemelding
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
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
    etterlevelseDokumentasjonId,
    activeStep,
    setActiveStep,
    setSelectedStep,
    formRef,
  } = props

  return (
    <div className="w-full">
      <div className="flex w-full">
        <div className="pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8">
          <div className="flex justify-center">
            <div>
              <Heading level="1" size="medium" className="mb-5">
                Behandlingens art og omfang
              </Heading>
              {pvkDokument.changeStamp.lastModifiedBy && (
                <div className="mt-5 mb-10">
                  {'Sist redigert av: ' + pvkDokument.changeStamp.lastModifiedBy}
                </div>
              )}

              <List
                headingTag="label"
                title="I Behandlingskatalogen står det at dere behandler personopplysninger om:"
              >
                {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
                {personkategorier.length > 0 &&
                  personkategorier.map((personkategori) => (
                    <List.Item key={personkategori}>{personkategori}</List.Item>
                  ))}
              </List>

              <div className="mt-5 mb-3 max-w-[75ch]">
                <Label>Stemmer denne lista over personkategorier?</Label>
                <BodyLong>{pvkDokument.stemmerPersonkategorier}</BodyLong>
              </div>

              <div className="mt-5 mb-3 max-w-[75ch]">
                <Label>
                  For hver av personkategoriene over, beskriv hvor mange personer dere behandler
                  personopplysninger om.
                </Label>
                <BodyLong>{pvkDokument.personkategoriAntallBeskrivelse}</BodyLong>
              </div>

              <div className="mt-5 mb-3 max-w-[75ch]">
                <Label>
                  Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av
                  rollene, beskriv hvor mange som har tilgang.
                </Label>
                <BodyLong>{pvkDokument.tilgangsBeskrivelsePersonopplysningene}</BodyLong>
              </div>

              <div className="mt-5 mb-3 max-w-[75ch]">
                <Label>Beskriv hvordan og hvor lenge personopplysningene skal lagres.</Label>
                <BodyLong>{pvkDokument.lagringsBeskrivelsePersonopplysningene}</BodyLong>
              </div>
            </div>
          </div>
        </div>

        {/* PVO sidepanel */}
        <div className="px-4 py-4 border-l border-[#071a3636] w-full max-w-md bg-[#F0EEF4] mt-35">
          <PvoTilbakemeldingForm
            pvkDokumentId={pvkDokument.id}
            fieldName="behandlingensArtOgOmfang"
            initialValue={pvoTilbakemelding.behandlingensArtOgOmfang}
            formRef={formRef}
          />
        </div>
      </div>
      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
      />
    </div>
  )
}
export default BehandlingensArtOgOmfangPvoView
