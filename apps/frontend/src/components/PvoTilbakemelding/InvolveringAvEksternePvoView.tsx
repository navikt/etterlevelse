import { BodyLong, Heading, Label, List } from '@navikt/ds-react'
import { RefObject } from 'react'
import { IPvkDokument, IPvoTilbakemelding } from '../../constants'
import FormButtons from '../PvkDokument/edit/FormButtons'
import PvoTilbakemeldingForm from './edit/PvoTilbakemeldingForm'

interface IProps {
  personkategorier: string[]
  databehandlere: string[]
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjonId: string
  pvoTilbakemelding: IPvoTilbakemelding
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const InvolveringAvEksternePvoView = (props: IProps) => {
  const {
    personkategorier,
    databehandlere,
    pvkDokument,
    pvoTilbakemelding,
    etterlevelseDokumentasjonId,
    activeStep,
    setActiveStep,
    setSelectedStep,
  } = props

  return (
    <div className="w-full">
      <div className="flex w-full">
        <div className="pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8">
          <div className="flex justify-center">
            <div>
              <Heading level="1" size="medium" className="mb-5">
                Involvering av eksterne deltakere
              </Heading>

              <Heading level="2" size="small" className="mb-3">
                Representanter for de registrerte
              </Heading>

              <List
                size="small"
                className="mt-5"
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
                <Label>Har dere involvert en representant for de registrerte?</Label>
                <BodyLong>{pvkDokument.harInvolvertRepresentant}</BodyLong>
              </div>

              {pvkDokument.representantInvolveringsBeskrivelse && (
                <div className="mt-5 mb-3 max-w-[75ch]">
                  <Label>
                    Utdyp hvordan dere har involvert representant(er) for de registrerte
                  </Label>
                  <BodyLong>{pvkDokument.representantInvolveringsBeskrivelse}</BodyLong>
                </div>
              )}

              {!pvkDokument.representantInvolveringsBeskrivelse && (
                <div className="mt-5 mb-3 max-w-[75ch]">
                  <Label>
                    Utdyp hvorfor dere ikke har involvert representant(er) for de registrerte
                  </Label>
                  <BodyLong>{pvkDokument.representantInvolveringsBeskrivelse}</BodyLong>
                </div>
              )}

              <List className="mt-10" title="Representanter for databehandlere">
                <BodyLong>
                  I Behandlingskatalogen står det at følgende databehandlere benyttes:
                </BodyLong>
                {databehandlere.length === 0 && <List.Item>Ingen</List.Item>}
                {databehandlere.length > 0 &&
                  databehandlere.map((databehandler) => (
                    <List.Item key={databehandler}>{databehandler}</List.Item>
                  ))}
              </List>

              <div className="mt-5 mb-3 max-w-[75ch]">
                <Label>Har dere involvert en representant for databehandlere?</Label>
                <BodyLong>{pvkDokument.harDatabehandlerRepresentantInvolvering}</BodyLong>
              </div>

              {pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse && (
                <div className="mt-5 mb-3 max-w-[75ch]">
                  <Label>
                    Utdyp hvordan dere har involvert representant(er) for databehandler(e)
                  </Label>
                  <BodyLong>{pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse}</BodyLong>
                </div>
              )}

              {!pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse && (
                <div className="mt-5 mb-3 max-w-[75ch]">
                  <Label>
                    Utdyp hvorfor dere ikke har involvert representant(er) for databehandler(e)
                  </Label>
                  <BodyLong>{pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse}</BodyLong>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* PVO sidepanel */}
        <div className="px-4 py-4 border-l border-[#071a3636] w-full max-w-md bg-[#F0EEF4] mt-35">
          <PvoTilbakemeldingForm
            pvkDokumentId={pvkDokument.id}
            fieldName="innvolveringAvEksterne"
            initialValue={pvoTilbakemelding.innvolveringAvEksterne}
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
export default InvolveringAvEksternePvoView
