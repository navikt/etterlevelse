import { BodyShort, Button, Heading, Radio, RadioGroup } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Field, FieldProps, Form, Formik } from 'formik'
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
  ITilbakemeldingsinnhold,
} from '../../../constants'
import { user } from '../../../services/User'
import { TextAreaField } from '../../common/Inputs'
import AlertPvoModal from '../common/AlertPvoModal'

export enum EBidragVerdier {
  TILSTREKKELIG = 'TILSTREKELIG',
  TILSTREKKELIG_FORBEHOLDT = 'TILSTREKKELIG_FORBEHOLDT',
  UTILSTREKKELIG = 'UTILSTREKELIG',
}

type TProps = {
  pvkDokumentId: string
  fieldName:
    | 'behandlingenslivslop'
    | 'behandlingensArtOgOmfang'
    | 'innvolveringAvEksterne'
    | 'risikoscenarioEtterTiltakk'
  initialValue: ITilbakemeldingsinnhold
  formRef: RefObject<any>
}

export const PvoTilbakemeldingForm: FunctionComponent<TProps> = ({
  fieldName,
  pvkDokumentId,
  initialValue,
  formRef,
}) => {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)

  const submit = async (tilbakemeldingsInnhold: ITilbakemeldingsinnhold): Promise<void> => {
    const mutatedTilbakemeldingsInnhold: ITilbakemeldingsinnhold = {
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
              behandlingenslivslop:
                fieldName === 'behandlingenslivslop'
                  ? mutatedTilbakemeldingsInnhold
                  : response.behandlingenslivslop,
              behandlingensArtOgOmfang:
                fieldName === 'behandlingensArtOgOmfang'
                  ? mutatedTilbakemeldingsInnhold
                  : response.behandlingensArtOgOmfang,
              innvolveringAvEksterne:
                fieldName === 'innvolveringAvEksterne'
                  ? mutatedTilbakemeldingsInnhold
                  : response.innvolveringAvEksterne,
              risikoscenarioEtterTiltakk:
                fieldName === 'risikoscenarioEtterTiltakk'
                  ? mutatedTilbakemeldingsInnhold
                  : response.risikoscenarioEtterTiltakk,
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
              behandlingenslivslop:
                fieldName === 'behandlingenslivslop' ? mutatedTilbakemeldingsInnhold : undefined,
              behandlingensArtOgOmfang:
                fieldName === 'behandlingensArtOgOmfang'
                  ? mutatedTilbakemeldingsInnhold
                  : undefined,
              innvolveringAvEksterne:
                fieldName === 'innvolveringAvEksterne' ? mutatedTilbakemeldingsInnhold : undefined,
              risikoscenarioEtterTiltakk:
                fieldName === 'risikoscenarioEtterTiltakk'
                  ? mutatedTilbakemeldingsInnhold
                  : undefined,
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
        onSubmit={(values: ITilbakemeldingsinnhold) => {
          submit(values)
        }}
        initialValues={initialValue}
        innerRef={formRef}
      >
        {({ setFieldValue, submitForm }) => (
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

              <Field name='bidragsVurdering'>
                {(fieldProps: FieldProps) => (
                  <RadioGroup
                    legend='Vurdér om etterleverens bidrag er tilstrekkelig'
                    value={fieldProps.field.value}
                    onChange={(value) => {
                      fieldProps.form.setFieldValue('bidragsVurdering', value)
                    }}
                    description='Denne vurderingen blir ikke tilgjengelig for etterleveren før dere har ferdigstilt selve vurderingen.'
                  >
                    <Radio value={EBidragVerdier.TILSTREKKELIG}>Ja, tilstrekkelig </Radio>
                    <Radio value={EBidragVerdier.TILSTREKKELIG_FORBEHOLDT}>
                      Tilstrekkelig, forbeholdt at etterleveren tar stilling til anbefalinger som
                      beskrives i fritekst under
                    </Radio>
                    <Radio value={EBidragVerdier.UTILSTREKKELIG}>
                      Utilstrekkelig, beskrives nærmere under
                    </Radio>
                  </RadioGroup>
                )}
              </Field>
            </div>

            <div className='my-2'>
              <Button
                size='small'
                type='button'
                variant='secondary'
                onClick={async () => {
                  await setFieldValue('bidragsVurdering', '')
                }}
              >
                Nullstill valg
              </Button>
            </div>

            <div className='my-5'>
              <TextAreaField
                noPlaceholder
                markdown
                height='15.625rem'
                name='tilbakemeldingTilEtterlevere'
                label='Skriv tilbakemelding til etterleveren'
                caption='Tilbakemeldingen blir ikke tilgjengelig for etterleveren før PVK-en sendes tilbake.'
                withUnderline={true}
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

export default PvoTilbakemeldingForm
