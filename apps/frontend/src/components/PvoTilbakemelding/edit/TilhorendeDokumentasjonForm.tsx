import { BodyLong, BodyShort, Button, Heading } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Form, Formik } from 'formik'
import moment from 'moment'
import { FunctionComponent, RefObject, useState } from 'react'
import { getPvkDokument } from '../../../api/PvkDokumentApi'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  updatePvoTilbakemelding,
} from '../../../api/PvoApi'
import {
  EPvkDokumentStatus,
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  ITilhorendeDokumentasjonTilbakemelding,
} from '../../../constants'
import { user } from '../../../services/User'
import { TextAreaField } from '../../common/Inputs'
import AlertPvoModal from '../common/AlertPvoModal'
import TilbakemeldingField from './tilhorendeDokumentasjon/TilbakemeldingField'

type TProps = {
  pvkDokumentId: string
  initialValue: ITilhorendeDokumentasjonTilbakemelding
  formRef: RefObject<any>
}

export const TilhorendeDokumentasjonForm: FunctionComponent<TProps> = ({
  pvkDokumentId,
  initialValue,
  formRef,
}) => {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)

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

    if (pvkStatus === EPvkDokumentStatus.UNDERARBEID) {
      setIsAlertModalOpen(true)
    } else {
      await getPvoTilbakemeldingByPvkDokumentId(pvkDokumentId)
        .then(async (response: IPvoTilbakemelding) => {
          if (response) {
            const updatedValues: IPvoTilbakemelding = {
              ...response,
              tilhorendeDokumentasjon: mutatedTilbakemeldingsInnhold,
              status:
                response.status === EPvoTilbakemeldingStatus.IKKE_PABEGYNT
                  ? EPvoTilbakemeldingStatus.UNDERARBEID
                  : response.status,
            }

            if (response.status === EPvoTilbakemeldingStatus.FERDIG) {
              setIsAlertModalOpen(true)
            } else {
              await updatePvoTilbakemelding(updatedValues).then(() => window.location.reload())
            }
          }
        })
        .catch(async (error: AxiosError) => {
          if (error.status === 404) {
            const createValue = mapPvoTilbakemeldingToFormValue({
              pvkDokumentId: pvkDokumentId,
              tilhorendeDokumentasjon: mutatedTilbakemeldingsInnhold,
              status: EPvoTilbakemeldingStatus.UNDERARBEID,
            })
            await createPvoTilbakemelding(createValue).then(() => window.location.reload())
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
                Vurdér om etterleverens bidrag er tilstrekkelig. Denne vurderingen blir ikke
                tilgjengelig for etterleveren før dere har ferdigstilt selve vurderingen.
              </BodyLong>
            </div>

            <div>
              <TilbakemeldingField
                heading='Behandlinger i Behandlingskatalogen'
                radioFieldName='behandlingskatalogDokumentasjonTilstrekkelig'
                radioFieldLabel='Vurdér om dokumentasjon i Behandlingskatalogen er tilstrekkelig.'
                textAreaFieldName='behandlingskatalogDokumentasjonTilbakemelding'
                setFieldValue={setFieldValue}
              />

              <TilbakemeldingField
                heading='PVK-relaterte etterlevelseskrav'
                radioFieldName='kravDokumentasjonTilstrekkelig'
                radioFieldLabel='Vurdér om kravdokumentasjon er tilstrekkelig.'
                textAreaFieldName='kravDokumentasjonTilbakemelding'
                setFieldValue={setFieldValue}
              />

              <TilbakemeldingField
                heading='Risiko- og sårbarhetsvurdering (ROS)'
                radioFieldName='risikovurderingTilstrekkelig'
                radioFieldLabel='Vurdér om risikovurderingen(e) er tilstrekkelig.'
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

export default TilhorendeDokumentasjonForm
