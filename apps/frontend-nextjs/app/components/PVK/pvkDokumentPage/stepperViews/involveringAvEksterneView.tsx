'use client'

import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '@/api/pvkDokument/pvkDokumentApi'
import { PvkSidePanelWrapper } from '@/components/PVK/common/pvkSidePanelWrapper'
import FormButtons from '@/components/PVK/edit/formButtons'
import InvolveringAvEksterneReadOnlyContent from '@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/involveringAvEksterneReadOnlyContent'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { BoolField } from '@/components/common/inputs'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { ContentLayout } from '@/components/others/layout/content/content'
import AlertPvoUnderArbeidModal from '@/components/pvoTilbakemelding/common/alertPvoUnderArbeidModal'
import PvoTilbakemeldingReadOnly from '@/components/pvoTilbakemelding/readOnly/pvoTilbakemeldingReadOnly'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPVK,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, BodyLong, Button, Heading, Label, List, Modal, ReadMore } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { FunctionComponent, RefObject, useState } from 'react'
import InfoChangesMadeAfterApproval from '../../common/infoChangesMadeAfterApproval'

type TProps = {
  personkategorier: string[]
  databehandlere: string[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  setPvkDokument: (pvkDokument: IPvkDokument) => void
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
  pvoTilbakemelding?: IPvoTilbakemelding
}

export const InvolveringAvEksterneView: FunctionComponent<TProps> = ({
  personkategorier,
  databehandlere,
  etterlevelseDokumentasjon,
  pvkDokument,
  setPvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvoTilbakemelding,
}) => {
  const [savedSuccessful, setSavedSuccessful] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isNullStilModalOpen, setIsNullStilModalOpen] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)

  const submit = async (pvkDokument: IPvkDokument): Promise<void> => {
    await getPvkDokument(pvkDokument.id).then(async (response: IPvkDokument) => {
      const updatedatePvkDokument = {
        ...response,
        harInvolvertRepresentant: pvkDokument.harInvolvertRepresentant,
        representantInvolveringsBeskrivelse: pvkDokument.representantInvolveringsBeskrivelse,
        harDatabehandlerRepresentantInvolvering:
          pvkDokument.harDatabehandlerRepresentantInvolvering,
        dataBehandlerRepresentantInvolveringBeskrivelse:
          pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse,
      }

      if (isReadOnlyPvkStatus(response.status)) {
        setIsPvoAlertModalOpen(true)
      } else {
        await updatePvkDokument(updatedatePvkDokument)
          .then((response: IPvkDokument) => {
            setPvkDokument(response)
          })
          .finally(() => setSavedSuccessful(true))
      }
    })
  }

  return (
    <div className='w-full'>
      <ContentLayout>
        {pvkDokument && !isReadOnlyPvkStatus(pvkDokument.status) && (
          <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
            <Formik
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={submit}
              initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
              innerRef={formRef}
            >
              {({ submitForm, values, resetForm, setFieldValue, dirty, initialValues }) => (
                <Form>
                  <div className='flex justify-center'>
                    <div className='max-w-[75ch]'>
                      <Heading level='1' size='medium' className='mb-5'>
                        Involvering av eksterne deltakere
                      </Heading>

                      <BodyLong className='mb-3'>
                        Personene Nav behandler personopplysninger om, kaller vi for &quot;de
                        registrerte&quot;.
                      </BodyLong>

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

                      {/* <Alert inline variant="info" className="my-5">
            Dersom disse typer personopplysninger ikke stemmer, må dere oppdatere
            Behandlingskatalogen.
          </Alert> */}

                      <BodyLong className='my-5'>
                        Dersom disse typer personopplysninger ikke stemmer, må dere oppdatere
                        Behandlingskatalogen.
                      </BodyLong>

                      <BodyLong>
                        Representanter for disse gruppene vil kunne bidra til å belyse hvilke
                        konsekvenser en behandling av personopplysninger kan ha for den enkelte. Når
                        vi gjennomfører en personvernkonsekvensvurdering (PVK), må vi derfor alltid
                        vurdere om det er behov for å involvere en representant for de registrerte.
                        mer informasjon finner dere i{' '}
                        <ExternalLink href='https://navno.sharepoint.com/sites/intranett-personvern/SiteAssets/Forms/AllItems.aspx?id=%2Fsites%2Fintranett%2Dpersonvern%2FSiteAssets%2FSitePages%2FPVK%2FBrosjyre%5FInvolvering%2Dav%2Dden%2Dregistrerte%2Dved%2Dgjennomf%C3%B8ring%2Dav%2DPVK%2Epdf&parent=%2Fsites%2Fintranett%2Dpersonvern%2FSiteAssets%2FSitePages%2FPVK'>
                          {'Brosjyre om involvering av den registrerte.'}
                        </ExternalLink>
                      </BodyLong>

                      <BodyLong className='mt-3'>
                        Hvis dere er usikre på om behandlingene treffer flere eller færre
                        personkategorier, kan det være til hjelp å se på behandlingens livsløp.
                      </BodyLong>

                      {/* <ReadMore
                    className="my-8 max-w-[75ch]"
                    header="Slik kan dere involvere de forskjellige gruppene"
                  >
                    Her står noen gode råd om hvordan du skal involvere de du behandler
                    personopplysninger om.
                  </ReadMore> */}

                      <div className='mt-3'>
                        <BoolField
                          label='1. Har dere involvert en representant for de registrerte?'
                          name='harInvolvertRepresentant'
                          horizontal
                        />
                      </div>

                      <div className='mt-5'>
                        <TextAreaField
                          rows={3}
                          noPlaceholder
                          label={
                            values.harInvolvertRepresentant ||
                            values.harInvolvertRepresentant === null
                              ? '2. Beskriv hvordan dere har involvert representant(er) for de registrerte'
                              : '2. Beskriv hvorfor dere ikke har involvert representant(er) for de registrerte'
                          }
                          name='representantInvolveringsBeskrivelse'
                        />
                      </div>

                      <List className='mt-10'>
                        <Heading size='medium'>Representanter for databehandlere</Heading>

                        <ReadMore className='my-3 max-w-[75ch]' header='Hva er en databehandler?'>
                          En databehandler er en virksomhet utenfor Nav som behandler data på dine
                          vegne.
                          <ExternalLink href='https://behandlingskatalog.ansatt.nav.no/processor'>
                            {'Her er en liste over databehandlere i behandlingskatalogen '}
                          </ExternalLink>
                        </ReadMore>

                        <BodyLong>
                          I Behandlingskatalogen står det at følgende databehandlere benyttes:
                        </BodyLong>
                        {databehandlere.length === 0 && <List.Item>Ingen</List.Item>}
                        {databehandlere.length > 0 &&
                          databehandlere.map((databehandler) => (
                            <List.Item key={databehandler}>{databehandler}</List.Item>
                          ))}
                      </List>

                      <BodyLong className='my-3'>
                        Dersom listen over behandlere ikke stemmer, må dere gjøre endringer i
                        Behandlingskatalogen.
                      </BodyLong>

                      <BodyLong>
                        Hvis dere er usikker på om behandlingene benytter flere eller færre
                        databehandlere, kan det være til hjelp å se på behandlingens livsløp.
                      </BodyLong>

                      <ReadMore className='mt-3' header='Trenger vi å involvere databehandlere?'>
                        Dersom det skal benyttes en databehandler i hele eller deler av
                        behandlingen, skal dere som hovedregel inkludere en representant for
                        databehandler i vurderingen av personvernkonsekvenser (PVK).
                        <br />
                        Når dere vurderer personvernrisiko, må dere sette dere inn i hvordan
                        databehandlere behandler personopplysninger. Det kan være aktuelt å
                        diskutere endringer i databehandleravtalen, for eksempel ved å be om
                        sletterutiner. Hvis dere selv er ansvarlige for anskaffelsen, skal dere
                        involvere databehandleren ved behov. Dersom andre team er ansvarlige, bør
                        dere ta kontakt med teamet for å melde fra om endringer dere ønsker å
                        diskutere.
                      </ReadMore>

                      <div className='mt-5'>
                        <BoolField
                          label='3. Har dere involvert en representant for databehandlere?'
                          name='harDatabehandlerRepresentantInvolvering'
                          horizontal
                        />
                      </div>

                      <div className='mt-3'>
                        <TextAreaField
                          rows={3}
                          noPlaceholder
                          label={
                            values.harDatabehandlerRepresentantInvolvering ||
                            values.harDatabehandlerRepresentantInvolvering === null
                              ? '4. Beskriv hvordan dere har involvert representant(er) for databehandler(e)'
                              : '4. Beskriv hvorfor dere ikke har involvert representant(er) for databehandler(e)'
                          }
                          name='dataBehandlerRepresentantInvolveringBeskrivelse'
                        />
                      </div>

                      {savedSuccessful && !dirty && (
                        <div className='mt-5'>
                          <Alert
                            variant='success'
                            closeButton
                            onClose={() => setSavedSuccessful(false)}
                          >
                            Lagring vellykket
                          </Alert>
                        </div>
                      )}

                      <InfoChangesMadeAfterApproval pvkDokument={pvkDokument} />

                      <div className='flex gap-2 mt-5'>
                        <Button
                          type='button'
                          onClick={async () => {
                            await submitForm()
                            resetForm({ values })
                          }}
                        >
                          Lagre
                        </Button>

                        <Button
                          type='button'
                          variant='secondary'
                          onClick={async () => {
                            setIsModalOpen(true)
                          }}
                        >
                          Forkast endringer
                        </Button>

                        <Button
                          type='button'
                          variant='tertiary'
                          onClick={async () => {
                            setIsNullStilModalOpen(true)
                          }}
                        >
                          Nullstill svar
                        </Button>
                      </div>

                      {isNullStilModalOpen && (
                        <Modal
                          open={isNullStilModalOpen}
                          onClose={() => setIsNullStilModalOpen(false)}
                          header={{ heading: 'Er du sikker på at du vil nullstille svarene?' }}
                        >
                          <Modal.Footer>
                            <Button
                              type='button'
                              onClick={async () => {
                                await setFieldValue('harInvolvertRepresentant', null)
                                await setFieldValue('representantInvolveringsBeskrivelse', '')
                                await setFieldValue('harDatabehandlerRepresentantInvolvering', null)
                                await setFieldValue(
                                  'dataBehandlerRepresentantInvolveringBeskrivelse',
                                  ''
                                )
                                await submitForm().then(() => {
                                  resetForm({
                                    values: {
                                      ...pvkDokument,
                                      harInvolvertRepresentant: undefined,
                                      representantInvolveringsBeskrivelse: '',
                                      harDatabehandlerRepresentantInvolvering: undefined,
                                      dataBehandlerRepresentantInvolveringBeskrivelse: '',
                                    },
                                  })
                                  setIsNullStilModalOpen(false)
                                })
                              }}
                            >
                              Ja, nullstill
                            </Button>
                            <Button
                              type='button'
                              variant='secondary'
                              onClick={() => {
                                setIsNullStilModalOpen(false)
                              }}
                            >
                              Nei, avbryt
                            </Button>
                          </Modal.Footer>
                        </Modal>
                      )}

                      {isModalOpen && (
                        <Modal
                          open={isModalOpen}
                          onClose={() => setIsModalOpen(false)}
                          header={{ heading: 'Er du sikker på at du vil forkaste endringene?' }}
                        >
                          <Modal.Footer>
                            <Button
                              type='button'
                              onClick={() => {
                                resetForm({ values: initialValues })
                                setIsModalOpen(false)
                              }}
                            >
                              Ja
                            </Button>
                            <Button
                              type='button'
                              variant='secondary'
                              onClick={() => {
                                setIsModalOpen(false)
                              }}
                            >
                              Nei
                            </Button>
                          </Modal.Footer>
                        </Modal>
                      )}
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
            <AlertPvoUnderArbeidModal
              isOpen={isPvoAlertModalOpen}
              onClose={() => setIsPvoAlertModalOpen(false)}
              pvkDokumentId={pvkDokument.id}
            />
          </div>
        )}

        {pvkDokument && isReadOnlyPvkStatus(pvkDokument.status) && (
          <InvolveringAvEksterneReadOnlyContent
            personkategorier={personkategorier}
            databehandlere={databehandlere}
            pvkDokument={pvkDokument}
          />
        )}
        {/* sidepanel */}

        {pvoTilbakemelding && pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
          <div>
            <PvkSidePanelWrapper>
              <PvoTilbakemeldingReadOnly
                tilbakemeldingsinnhold={pvoTilbakemelding.innvolveringAvEksterne}
                sentDate={pvoTilbakemelding.sendtDato}
              />
            </PvkSidePanelWrapper>
          </div>
        )}
      </ContentLayout>
      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
      />
    </div>
  )
}

export default InvolveringAvEksterneView
