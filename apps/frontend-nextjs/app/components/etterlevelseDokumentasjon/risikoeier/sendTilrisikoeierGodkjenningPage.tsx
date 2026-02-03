'use client'

import {
  etterlevelseDokumentasjonMapToFormVal,
  getEtterlevelseDokumentasjon,
  updateEtterlevelseDokumentasjon,
  useEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { Markdown } from '@/components/common/markdown/markdown'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  etterlevelseDokumentasjonIdUrl,
  etterlevelsesDokumentasjonEditUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Alert, BodyLong, Button, Heading, Label, Link, List } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import EtterlevelsesDokumentasjonGodkjenningsHistorikk from './common/etterlevelsesDokumentasjonGodkjenningsHistorikk'

export const SendTilRisikoeierGodkjenningPage = () => {
  const params: Readonly<
    Partial<{
      etterlevelseDokumentasjonId?: string
    }>
  > = useParams<{ etterlevelseDokumentasjonId?: string }>()
  const [
    etterlevelseDokumentasjon,
    setEtterlevelseDokumentasjon,
    isEtterlevelseDokumentasjonLoading,
  ] = useEtterlevelseDokumentasjon(params.etterlevelseDokumentasjonId)

  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
      pathName: `E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon?.title}`,
    },
  ]

  const [submitAlert, setSubmitAlert] = useState<boolean>(false)
  const [saveSuccessfull, setSaveSuccessfull] = useState<boolean>(false)
  const errorMessage = 'Kan ikke redigere en etterlevelse som er godkjent av risikoeier.'

  const submit = async (submitValues: IEtterlevelseDokumentasjon) => {
    await getEtterlevelseDokumentasjon(submitValues.id).then(async (response) => {
      if (response.status === EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER) {
        setSubmitAlert(true)
      } else {
        const updatedEtterlevelseDokumentasjon = { ...response }
        updatedEtterlevelseDokumentasjon.status = submitValues.status
        updatedEtterlevelseDokumentasjon.meldingEtterlevelerTilRisikoeier =
          submitValues.meldingEtterlevelerTilRisikoeier

        await updateEtterlevelseDokumentasjon(updatedEtterlevelseDokumentasjon).then((resp) => {
          setEtterlevelseDokumentasjon(resp)
          setSaveSuccessfull(true)
        })
      }
    })
  }

  const hasAccess =
    etterlevelseDokumentasjon && etterlevelseDokumentasjon.hasCurrentUserAccess === true

  console.debug(
    'check this',
    hasAccess &&
      etterlevelseDokumentasjon.status ===
        EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
  )
  return (
    <PageLayout
      pageTitle='Få etterlevelsen godkjent av risikoeier'
      currentPage='Få etterlevelsen godkjent av risikoeier'
      breadcrumbPaths={breadcrumbPaths}
    >
      {isEtterlevelseDokumentasjonLoading && <CenteredLoader />}

      {!isEtterlevelseDokumentasjonLoading && etterlevelseDokumentasjon && (
        <div>
          <Heading level='1' size='large' className='mb-10'>
            Få etterlevelsen godkjent av risikoeier
          </Heading>
          {etterlevelseDokumentasjon.etterlevelseDokumentVersjon > 1 && (
            <EtterlevelsesDokumentasjonGodkjenningsHistorikk
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            />
          )}
          <Heading level='2' size='medium' className='mb-5'>
            Send til {etterlevelseDokumentasjon.etterlevelseDokumentVersjon === 1 ? '' : 'ny'}{' '}
            godkjenning
          </Heading>
          {etterlevelseDokumentasjon.risikoeiere.length === 0 && (
            <Alert variant='warning' className='my-5'>
              <Heading spacing size='small' level='3'>
                Denne etterlevelsen har ikke en nevnt risikoeier
              </Heading>
              Risikoeier må legges til under{' '}
              <Link
                target='_blank'
                rel='noopener noreferrer'
                href={`${etterlevelsesDokumentasjonEditUrl(params.etterlevelseDokumentasjonId)}#risikoeiereData`}
                className='inline'
              >
                Rediger dokumentegenskaper.
              </Link>{' '}
              Dere kan ikke sende etterlevelsen til godkjenning uten en utnevnt risikoeier.
            </Alert>
          )}
          <BodyLong>
            Dere kan til enhver tid be risikoeier om å godkjenne etterlevelsesdokumentasjonen.
            Risikoeieren vil da godkjenne:
          </BodyLong>
          <List as='ul' className='max-w-[75ch]'>
            <List.Item>
              Dokumentasjon av alle etterlevelseskrav som er en del av etterlevelsesdokumentet på
              godkjenningstidspunktet. Dette gjelder også etterlevelseskrav som ikke er ferdigstilt.
            </List.Item>
            <List.Item>
              Svar på om det er nødvendig å gjennomføre PVK. Dette gjelder kun hvis dere har huket
              av for at personopplysninger behandles under Dokumentegenskaper.
            </List.Item>
          </List>
          <BodyLong className='mt-5'>
            Risikoeier vil kun godkjenne etterlevelsesdokumentet. Dersom det finnes et PVK-dokument,
            vil dette ikke være en del av denne godkjenningen.
            <br />
            <br />
            Når risikoeier godkjenner, arkiveres etterlevelsen og godkjenningen i Public 360.
          </BodyLong>

          {etterlevelseDokumentasjon.status === EEtterlevelseDokumentasjonStatus.UNDER_ARBEID &&
            hasAccess && (
              <Formik
                validateOnChange={false}
                validateOnBlur={false}
                initialValues={etterlevelseDokumentasjonMapToFormVal(etterlevelseDokumentasjon)}
                onSubmit={submit}
              >
                {({ submitForm, setFieldValue }) => (
                  <Form>
                    <div className='mt-3 max-w-[75ch]'>
                      <TextAreaField
                        rows={5}
                        height='12.5rem'
                        noPlaceholder
                        label='Oppsummer for risikoeier hvorfor det er aktuelt med godkjenning'
                        name='meldingEtterlevelerTilRisikoeier'
                        markdown
                      />
                    </div>

                    {etterlevelseDokumentasjon.risikoeiere.length > 0 && (
                      <div>
                        <div className='my-10 max-w-[75ch]'>
                          <Alert variant='info' inline>
                            Når dere sender etterlevelsen til godkjenning, vil hele dokumentasjonen
                            låses og ikke kunne redigeres. Etter at risikoeier har godkjent, vil
                            dere kunne redigere på nytt.
                          </Alert>
                        </div>

                        {saveSuccessfull && (
                          <div className='my-5 max-w-[75ch]'>
                            <Alert
                              size='small'
                              variant='success'
                              closeButton
                              onClose={() => setSaveSuccessfull(false)}
                            >
                              Lagring vellykket
                            </Alert>
                          </div>
                        )}

                        {submitAlert && (
                          <Alert
                            variant='error'
                            className='my-5'
                            closeButton={true}
                            onClose={() => setSubmitAlert(false)}
                          >
                            {errorMessage}
                          </Alert>
                        )}

                        <div className='flex items-center mt-5 gap-2'>
                          <Button
                            type='button'
                            variant='secondary'
                            onClick={async () => {
                              await setFieldValue(
                                'status',
                                EEtterlevelseDokumentasjonStatus.UNDER_ARBEID
                              )
                              await submitForm()
                            }}
                          >
                            Lagre og fortsett senere
                          </Button>

                          <Button
                            type='button'
                            variant='primary'
                            onClick={async () => {
                              await setFieldValue(
                                'status',
                                EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
                              )

                              await submitForm()
                            }}
                          >
                            Lagre og send til godkjenning
                          </Button>
                        </div>
                      </div>
                    )}
                  </Form>
                )}
              </Formik>
            )}
          {/* Read only view */}
          {([
            EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER,
            EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER,
          ].includes(etterlevelseDokumentasjon.status) ||
            !hasAccess) && (
            <div className='mt-7 mb-5 max-w-[75ch]'>
              <Label>Oppsummer for risikoeier hvorfor det er aktuelt med godkjenning</Label>
              <DataTextWrapper>
                {etterlevelseDokumentasjon &&
                  !['', null, undefined].includes(
                    etterlevelseDokumentasjon.meldingEtterlevelerTilRisikoeier
                  ) && (
                    <Markdown source={etterlevelseDokumentasjon.meldingEtterlevelerTilRisikoeier} />
                  )}

                {!etterlevelseDokumentasjon ||
                  (etterlevelseDokumentasjon &&
                    ['', null, undefined].includes(
                      etterlevelseDokumentasjon.meldingEtterlevelerTilRisikoeier
                    ) && <BodyLong>Det er ikke lagt til notat.</BodyLong>)}
              </DataTextWrapper>

              {saveSuccessfull && (
                <div className='my-5 max-w-[75ch]'>
                  <Alert
                    size='small'
                    variant='success'
                    closeButton
                    onClose={() => setSaveSuccessfull(false)}
                  >
                    Sendt til godkjenning
                  </Alert>
                </div>
              )}

              {hasAccess &&
                etterlevelseDokumentasjon.status ===
                  EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER && (
                  <div>
                    {submitAlert && (
                      <Alert
                        variant='error'
                        className='my-5'
                        closeButton={true}
                        onClose={() => setSubmitAlert(false)}
                      >
                        {errorMessage}
                      </Alert>
                    )}
                    <Button
                      className='mt-5'
                      variant='primary'
                      type='button'
                      onClick={async () => {
                        await submit({
                          ...etterlevelseDokumentasjon,
                          status: EEtterlevelseDokumentasjonStatus.UNDER_ARBEID,
                        })
                      }}
                    >
                      Trekk innsending
                    </Button>
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  )
}

export default SendTilRisikoeierGodkjenningPage
