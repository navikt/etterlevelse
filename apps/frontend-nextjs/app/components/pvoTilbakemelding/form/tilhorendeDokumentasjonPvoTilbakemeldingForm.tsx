'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  updatePvoTilbakemelding,
} from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  ITilhorendeDokumentasjonTilbakemelding,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { createNewPvoVurderning } from '@/util/pvoTilbakemelding/pvoTilbakemeldingUtils'
import { Alert, BodyLong, BodyShort, Button, Heading } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Form, Formik } from 'formik'
import moment from 'moment'
import { FunctionComponent, RefObject, useContext, useState } from 'react'
import AlertPvoModal from '../common/alertPvoModal'
import TilbakemeldingField from './tilbakemeldingField'

type TProps = {
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
  pvkDokumentId: string
  innsendingId: number
  initialValue: ITilhorendeDokumentasjonTilbakemelding
  formRef: RefObject<any>
}

export const TilhorendeDokumentasjonPvoTilbakemeldingForm: FunctionComponent<TProps> = ({
  setPvoTilbakemelding,
  pvkDokumentId,
  innsendingId,
  initialValue,
  formRef,
}) => {
  const user = useContext(UserContext)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)
  const [savedSuccessful, setSavedSuccessful] = useState<boolean>(false)

  const submit = async (
    tilbakemeldingsInnhold: ITilhorendeDokumentasjonTilbakemelding
  ): Promise<void> => {
    const mutatedTilbakemeldingsInnhold: ITilhorendeDokumentasjonTilbakemelding = {
      ...tilbakemeldingsInnhold,
      sistRedigertAv: user.getIdent() + ' - ' + user.getName(),
      sistRedigertDato: new Date().toISOString(),
    }

    let pvkStatus = ''

    await getPvkDokument(pvkDokumentId).then((response) => (pvkStatus = response.status))

    if (
      ![
        EPvkDokumentStatus.SENDT_TIL_PVO,
        EPvkDokumentStatus.PVO_UNDERARBEID,
        EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
      ].includes(pvkStatus as EPvkDokumentStatus)
    ) {
      setIsAlertModalOpen(true)
    } else {
      await getPvoTilbakemeldingByPvkDokumentId(pvkDokumentId)
        .then(async (response: IPvoTilbakemelding) => {
          if (response) {
            if (
              !response.vurderinger.find((vurdering) => vurdering.innsendingId === innsendingId)
            ) {
              response.vurderinger.push(createNewPvoVurderning(innsendingId))
            }
            const updatedValues: IPvoTilbakemelding = {
              ...response,
              vurderinger: response.vurderinger.map((vurdering) => {
                if (vurdering.innsendingId === innsendingId) {
                  return {
                    ...vurdering,
                    tilhorendeDokumentasjon: mutatedTilbakemeldingsInnhold,
                  }
                } else {
                  return vurdering
                }
              }),
              status:
                response.status === EPvoTilbakemeldingStatus.IKKE_PABEGYNT ||
                response.status === EPvoTilbakemeldingStatus.TRENGER_REVURDERING
                  ? EPvoTilbakemeldingStatus.UNDERARBEID
                  : response.status,
            }

            if (response.status === EPvoTilbakemeldingStatus.FERDIG) {
              setIsAlertModalOpen(true)
            } else {
              await updatePvoTilbakemelding(updatedValues).then((response) => {
                setPvoTilbakemelding(mapPvoTilbakemeldingToFormValue(response))
                const relevantVurdering = response.vurderinger.filter(
                  (vurdering) => vurdering.innsendingId === innsendingId
                )[0]
                const newInitailValues = relevantVurdering.tilhorendeDokumentasjon

                formRef.current.resetForm({ values: newInitailValues })
                setSavedSuccessful(true)
              })
            }
          }
        })
        .catch(async (error: AxiosError) => {
          if (error.status === 404) {
            const newVurdering = createNewPvoVurderning(innsendingId)
            const createValue = mapPvoTilbakemeldingToFormValue({
              pvkDokumentId: pvkDokumentId,
              vurderinger: [
                {
                  ...newVurdering,
                  tilhorendeDokumentasjon: mutatedTilbakemeldingsInnhold,
                },
              ],
              status: EPvoTilbakemeldingStatus.UNDERARBEID,
            })
            await createPvoTilbakemelding(createValue).then((response) => {
              setPvoTilbakemelding(mapPvoTilbakemeldingToFormValue(response))
              const relevantVurdering = response.vurderinger.filter(
                (vurdering) => vurdering.innsendingId === innsendingId
              )[0]
              const newInitailValues = relevantVurdering.tilhorendeDokumentasjon

              formRef.current.resetForm({ values: newInitailValues })
              setSavedSuccessful(true)
            })
          } else {
            console.debug(error)
          }
        })
    }
  }

  return (
    <div>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={(values: ITilhorendeDokumentasjonTilbakemelding) => {
          submit(values)
        }}
        initialValues={initialValue}
        innerRef={formRef}
      >
        {({ submitForm, setFieldValue }) => (
          <Form>
            <div className='z-10 flex flex-col w-full button_container sticky top-0 bg-[#e3eff7]'>
              <div className='mt-2 mb-5 flex flex-row gap-2'>
                <div>
                  <Button size='small' type='button' onClick={submitForm}>
                    Lagre
                  </Button>
                </div>
                <div>
                  <Button
                    size='small'
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      window.location.reload()
                    }}
                  >
                    Forkast endringer
                  </Button>
                </div>
              </div>
              {savedSuccessful && (
                <div className='my-5'>
                  <Alert
                    size='small'
                    variant='success'
                    closeButton
                    onClose={() => setSavedSuccessful(false)}
                  >
                    Lagring vellykket
                  </Alert>
                </div>
              )}
            </div>

            <div>
              {initialValue.sistRedigertAv && initialValue.sistRedigertDato && (
                <BodyShort size='medium' className='pb-5'>
                  Sist endret: {moment(initialValue.sistRedigertDato).format('LL')} av{' '}
                  {initialValue.sistRedigertAv.split('-')[1]}
                </BodyShort>
              )}
            </div>

            <div className='my-5'>
              <TextAreaField
                noPlaceholder
                markdown
                height='15.625rem'
                name='internDiskusjon'
                label='Skriv eventuelt interne PVO-notater her'
                caption='Denne teksten er privat for PVO og skal ikke deles med etterleveren'
                withHighlight={true}
                withUnderline={true}
              />
            </div>

            <div className='h-0.5  w-full border-2 my-7' />

            <div>
              <Heading level='2' size='small' className='mb-5'>
                Gi tilbakemelding
              </Heading>

              <BodyLong>
                Vurder om etterleverens bidrag er tilstrekkelig. Denne vurderingen blir ikke
                tilgjengelig for etterleveren før dere har ferdigstilt selve vurderingen.
              </BodyLong>
            </div>

            <div>
              <TilbakemeldingField
                heading='Behandlinger i Behandlingskatalogen'
                radioFieldName='behandlingskatalogDokumentasjonTilstrekkelig'
                radioFieldLabel='Vurder om dokumentasjon i Behandlingskatalogen er tilstrekkelig.'
                textAreaFieldName='behandlingskatalogDokumentasjonTilbakemelding'
                setFieldValue={setFieldValue}
              />

              <TilbakemeldingField
                heading='PVK-relaterte etterlevelseskrav'
                radioFieldName='kravDokumentasjonTilstrekkelig'
                radioFieldLabel='Vurder om kravdokumentasjon er tilstrekkelig.'
                textAreaFieldName='kravDokumentasjonTilbakemelding'
                setFieldValue={setFieldValue}
              />

              <TilbakemeldingField
                heading='Risiko- og sårbarhetsvurdering (ROS)'
                radioFieldName='risikovurderingTilstrekkelig'
                radioFieldLabel='Vurder om risikovurderingen(e) er tilstrekkelig.'
                textAreaFieldName='risikovurderingTilbakemelding'
                setFieldValue={setFieldValue}
              />
            </div>
          </Form>
        )}
      </Formik>
      {isAlertModalOpen && (
        <AlertPvoModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          pvkDokumentId={pvkDokumentId}
        />
      )}
    </div>
  )
}

export default TilhorendeDokumentasjonPvoTilbakemeldingForm
