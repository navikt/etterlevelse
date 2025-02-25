import {
  BodyLong,
  Button,
  Heading,
  Label,
  List,
  Radio,
  RadioGroup,
  ReadMore,
  ToggleGroup,
} from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { RefObject, useState } from 'react'
import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '../../api/PvkDokumentApi'
import { IPvkDokument, TEtterlevelseDokumentasjonQL } from '../../constants'
import { user } from '../../services/User'
import { BoolField, TextAreaField } from '../common/Inputs'
import { Markdown } from '../common/Markdown'
import TextEditor from '../common/TextEditor/TextEditor'
import FormButtons from './edit/FormButtons'

interface IProps {
  personkategorier: string[]
  databehandlere: string[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  setPvkDokument: (pvkDokument: IPvkDokument) => void
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const InvolveringAvEksterneView = (props: IProps) => {
  const {
    personkategorier,
    databehandlere,
    etterlevelseDokumentasjon,
    pvkDokument,
    setPvkDokument,
    activeStep,
    setActiveStep,
    setSelectedStep,
    formRef,
  } = props

  const submit = async (pvkDokument: IPvkDokument) => {
    getPvkDokument(pvkDokument.id).then(async (response) => {
      const updatedatePvkDokument = {
        ...response,
        harInvolvertRepresentant: pvkDokument.harInvolvertRepresentant,
        representantInvolveringsBeskrivelse: pvkDokument.representantInvolveringsBeskrivelse,
        harDatabehandlerRepresentantInvolvering:
          pvkDokument.harDatabehandlerRepresentantInvolvering,
        dataBehandlerRepresentantInvolveringBeskrivelse:
          pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse,
      }
      await updatePvkDokument(updatedatePvkDokument).then((response) => {
        setPvkDokument(response)
        window.location.reload()
      })
    })
  }

  const [mode, setMode] = useState('edit')
  const [value, setValue] = useState('')

  return (
    <div className="flex w-full">
      {(!user.isPersonvernombud() || user.isAdmin()) && (
        <div className="pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8">
          <Formik
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={submit}
            initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
            innerRef={formRef}
          >
            {({ submitForm, values }) => (
              <Form>
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

                    {/* <Alert inline variant="info" className="my-5">
            Dersom disse typer personopplysninger ikke stemmer, må dere oppdatere
            Behandlingskatalogen.
          </Alert> */}

                    <BodyLong className="my-5">
                      Dersom disse typer personopplysninger ikke stemmer, må dere oppdatere
                      Behandlingskatalogen.
                    </BodyLong>

                    <BodyLong>
                      Representanter for disse gruppene vil kunne bidra til å belyse hvilke
                      konsekvenser en behandling av personopplysninger kan ha for den enkelte. Når
                      vi gjennomfører en personvernkonsekvensvurdering (PVK), må vi derfor alltid
                      vurdere om det er behov for å involvere en representant for de registrerte.
                    </BodyLong>

                    <BodyLong className="mt-3">
                      Hvis dere er usikre på om behandlingene treffer flere eller færre
                      personkategorier, kan det være til hjelp å se på behandlingens livsløp.
                    </BodyLong>

                    <ReadMore
                      className="my-8 max-w-[75ch]"
                      header="Slik kan dere involvere de forskjellige gruppene"
                    >
                      Her står noen gode råd om hvordan du skal involvere de du behandler
                      personopplysninger om.
                    </ReadMore>

                    <div className="mt-3">
                      <BoolField
                        label="Har dere involvert en representant for de registrerte?"
                        name="harInvolvertRepresentant"
                        horizontal
                      />
                    </div>

                    <div className="mt-5 max-w-[75ch]">
                      <TextAreaField
                        rows={3}
                        noPlaceholder
                        label={
                          values.harInvolvertRepresentant ||
                          values.harInvolvertRepresentant === null
                            ? 'Utdyp hvordan dere har involvert representant(er) for de registrerte'
                            : 'Utdyp hvorfor dere ikke har involvert representant(er) for de registrerte'
                        }
                        name="representantInvolveringsBeskrivelse"
                      />
                    </div>

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

                    <BodyLong className="my-3">
                      Dersom listen over behandlere ikke stemmer, må dere gjøre endringer i
                      Behandlingskatalogen.
                    </BodyLong>

                    <BodyLong>
                      Hvis dere er usikker på om behandlingene benytter flere eller færre
                      databehandlere, kan det være til hjelp å se på behandlingens livsløp.
                    </BodyLong>

                    <BodyLong className="mt-5">
                      Dersom det skal benyttes en databehandler i hele eller deler av behandlingen,
                      skal dere som hovedregel inkludere en representant for databehandler i
                      vurderingen av personvernkonsekvenser (PVK).
                    </BodyLong>

                    <ReadMore
                      className="mt-3 max-w-[75ch]"
                      header="Trenger vi å snakke direkte med databehandlere?"
                    >
                      Gode råd her om hvordan bestemme om man må ta en egen prat med databehandlere,
                      kontra tilfeller hvor NAV kan ha avtaler med store aktører. Lenker til IT og
                      Anskaffelse sine sider, osv.
                    </ReadMore>

                    <div className="mt-5">
                      <BoolField
                        label="Har dere involvert en representant for databehandlere?"
                        name="harDatabehandlerRepresentantInvolvering"
                        horizontal
                      />
                    </div>

                    <div className="mt-3 max-w-[75ch]">
                      <TextAreaField
                        rows={3}
                        noPlaceholder
                        label={
                          values.harDatabehandlerRepresentantInvolvering ||
                          values.harDatabehandlerRepresentantInvolvering === null
                            ? 'Utdyp hvordan dere har involvert representant(er) for databehandler(e)'
                            : 'Utdyp hvorfor dere ikke har involvert representant(er) for databehandler(e)'
                        }
                        name="dataBehandlerRepresentantInvolveringBeskrivelse"
                      />
                    </div>

                    <div className="mt-5">
                      <Button
                        type="button"
                        onClick={() => {
                          if (submitForm) {
                            submitForm()
                          }
                        }}
                      >
                        Lagre
                      </Button>
                    </div>

                    <FormButtons
                      etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                      activeStep={activeStep}
                      setActiveStep={setActiveStep}
                      setSelectedStep={setSelectedStep}
                      submitForm={submitForm}
                    />
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {(user.isPersonvernombud() || user.isAdmin()) && (
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

              <Heading level="2" size="small" className="mb-3">
                Representanter for databehandlere
              </Heading>

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
      )}
      {/* PVO sidepanel */}
      {(user.isPersonvernombud() || user.isAdmin()) && (
        <div className="px-4 py-4 border-l border-[#071a3636] w-full max-w-md bg-[#F0EEF4] mt-35">
          <div>
            <RadioGroup
              legend="Vurdér om etterleverens bidrag er tilstrekkelig"
              // onChange={handleChange}
              description="Denne vurderingen blir ikke tilgjengelig for etterleveren før dere har ferdigstilt selve vurderingen."
            >
              <Radio value="JA">Ja, tilstrekkelig </Radio>
              <Radio value="Tilstrekkelig">
                Tilstrekkelig, forbeholdt at etterleveren tar stilling til anbefalinger som
                beskrives i fritekst under
              </Radio>
              <Radio value="40">Utilstrekkelig, beskrives nærmere under</Radio>
            </RadioGroup>
          </div>
          <div className="my-5">
            <Label>Skriv intern PVO diskusjon her</Label>
            <BodyLong>Denne teksten er privat for PVO og skal ikke deles med etterleveren</BodyLong>
          </div>
          <div>
            {mode === 'edit' && (
              <TextEditor
                initialValue={value}
                setValue={setValue}
                height="15.625rem"
                // setIsFormDirty={setIsFormDirty}
              />
            )}

            {mode === 'view' && (
              <div className="p-8 border-border-subtle-hover border border-solid rounded-md bg-white">
                <Markdown source={''} />
              </div>
            )}
          </div>
          <div className="flex justify-end mt-[-1px]">
            <ToggleGroup defaultValue="edit" onChange={setMode} size="small">
              <ToggleGroup.Item value="edit">Redigering</ToggleGroup.Item>
              <ToggleGroup.Item value="view">Forhåndsvisning</ToggleGroup.Item>
            </ToggleGroup>
          </div>
          <div className="my-5">
            <Label>Skriv tilbakemelding til etterleveren</Label>
            <BodyLong>
              Tilbakemeldingen blir ikke tilgjengelig for etterleveren før du velger å publisere
              den.{' '}
            </BodyLong>
          </div>
          <div>
            {mode === 'edit' && (
              <TextEditor
                initialValue={value}
                setValue={setValue}
                height="15.625rem"
                // setIsFormDirty={setIsFormDirty}
              />
            )}

            {mode === 'view' && (
              <div className="p-8 border-border-subtle-hover border border-solid rounded-md bg-white">
                <Markdown source={''} />
              </div>
            )}
          </div>
          <div className="flex justify-end mt-[-1px]">
            <ToggleGroup defaultValue="edit" onChange={setMode} size="small">
              <ToggleGroup.Item value="edit">Redigering</ToggleGroup.Item>
              <ToggleGroup.Item value="view">Forhåndsvisning</ToggleGroup.Item>
            </ToggleGroup>
          </div>
          <div className="mt-10 flex flex-row gap-2">
            <div>
              <Button
                size="small"
                onClick={() => {
                  setValue('')
                }}
              >
                Lagre
              </Button>
            </div>
            <div>
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setValue('')
                }}
              >
                Avbryt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default InvolveringAvEksterneView
