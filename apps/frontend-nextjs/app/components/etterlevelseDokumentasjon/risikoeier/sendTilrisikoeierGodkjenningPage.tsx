'use client'

import {
  etterlevelseDokumentasjonMapToFormVal,
  getEtterlevelseDokumentasjon,
  updateEtterlevelseDokumentasjon,
  useEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
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
  EPvkDokumentStatus,
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { UserContext } from '@/provider/user/userProvider'
import {
  etterlevelseDokumentasjonIdUrl,
  etterlevelsesDokumentasjonEditUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  Button,
  ErrorSummary,
  Heading,
  InfoCard,
  Label,
  Link,
  List,
} from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import _ from 'lodash'
import { useParams } from 'next/navigation'
import { RefObject, useContext, useEffect, useRef, useState } from 'react'
import EtterlevelsesDokumentasjonGodkjenningsHistorikk from './common/etterlevelsesDokumentasjonGodkjenningsHistorikk'
import { sendTilRisikoGodkjenningSchema } from './sendTilrisikoeierGodkjenningSchema'

export const SendTilRisikoeierGodkjenningPage = () => {
  const formRef: RefObject<any> = useRef(undefined)
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  const user = useContext(UserContext)
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
      pathName: `E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()}.${etterlevelseDokumentasjon?.etterlevelseDokumentVersjon} ${etterlevelseDokumentasjon?.title}`,
    },
  ]

  const [pvkDokument, setPvkDokument] = useState<IPvkDokument | undefined>(undefined)

  useEffect(() => {
    if (etterlevelseDokumentasjon?.id) {
      getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
        .then(setPvkDokument)
        .catch(() => setPvkDokument(undefined))
    }
  }, [etterlevelseDokumentasjon?.id])

  const pvkBlocksSending =
    pvkDokument !== undefined &&
    pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE &&
    pvkDokument.status !== EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER

  const [submitAlert, setSubmitAlert] = useState<string>('')
  const [saveSuccessfull, setSaveSuccessfull] = useState<boolean>(false)
  const [trekkInnsendingSuccessfull, setTrekkInnsendingSuccessfull] = useState<boolean>(false)

  const submit = async (submitValues: IEtterlevelseDokumentasjon, skipSaveAlert?: boolean) => {
    await getEtterlevelseDokumentasjon(submitValues.id).then(async (response) => {
      if (response.status === EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER) {
        setSubmitAlert('Etterlevelsesdokument er allerede godkjent av risikoeier.')
      } else {
        const pvkDokument = await getPvkDokumentByEtterlevelseDokumentId(submitValues.id).catch(
          () => undefined
        )
        if (
          pvkDokument &&
          pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE &&
          pvkDokument.status !== EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
          submitValues.status ===
            EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
        ) {
          setSubmitAlert(
            'Kan ikke sende til godkjenning når det finnes en personvernkonsekvensvurdering som ikke er ferdig.'
          )
        } else {
          const updatedEtterlevelseDokumentasjon = { ...response }
          updatedEtterlevelseDokumentasjon.status = submitValues.status
          updatedEtterlevelseDokumentasjon.meldingEtterlevelerTilRisikoeier =
            submitValues.meldingEtterlevelerTilRisikoeier

          await updateEtterlevelseDokumentasjon(updatedEtterlevelseDokumentasjon).then((resp) => {
            setEtterlevelseDokumentasjon(resp)
            if (!skipSaveAlert) setSaveSuccessfull(true)
          })
        }
      }
    })
  }

  const hasAccess =
    (etterlevelseDokumentasjon && etterlevelseDokumentasjon.hasCurrentUserAccess === true) ||
    user.isAdmin()

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
          {pvkBlocksSending && (
            <InfoCard data-color='warning' className='mb-5 max-w-[75ch]' size='small'>
              <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                <InfoCard.Title>
                  Dere kan ikke sende etterlevelsen til risikoeier før deres PVK er ferdig godkjent.
                </InfoCard.Title>
              </InfoCard.Header>
            </InfoCard>
          )}
          {etterlevelseDokumentasjon.risikoeiere.length === 0 && (
            <InfoCard data-color='warning' className='my-5 max-w-[75ch]' size='small'>
              <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                <InfoCard.Title>
                  <div>
                    <Heading spacing size='small' level='3'>
                      Denne etterlevelsen har ingen risikoeier
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
                  </div>
                </InfoCard.Title>
              </InfoCard.Header>
            </InfoCard>
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
                onSubmit={(values) => submit(values)}
                validationSchema={sendTilRisikoGodkjenningSchema()}
                innerRef={formRef}
              >
                {({ submitForm, setFieldValue, errors }) => (
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

                    <div>
                      <div className='my-10 max-w-[75ch]'>
                        <Alert variant='info' inline>
                          Når dere sender etterlevelsen til godkjenning, vil hele dokumentasjonen
                          låses og ikke kunne redigeres. Etter at risikoeier har godkjent, vil dere
                          kunne redigere på nytt.
                        </Alert>
                      </div>

                      <div className='my-10 max-w-[75ch]'>
                        {!_.isEmpty(errors) && (
                          <ErrorSummary
                            className='mt-3'
                            ref={errorSummaryRef}
                            heading='Før dere sender inn, må dere fylle ut følgende felt'
                          >
                            <ErrorSummary.Item href={'#meldingEtterlevelerTilRisikoeier'}>
                              Oppsummere for risikoeier hvorfor det er aktuelt med godkjenning
                            </ErrorSummary.Item>
                          </ErrorSummary>
                        )}
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

                      {trekkInnsendingSuccessfull && (
                        <div className='my-5 max-w-[75ch]'>
                          <Alert
                            size='small'
                            variant='success'
                            closeButton
                            onClose={() => setTrekkInnsendingSuccessfull(false)}
                          >
                            Innsending er trukket
                          </Alert>
                        </div>
                      )}

                      {submitAlert !== '' && (
                        <Alert
                          variant='error'
                          className='my-5 max-w-[75ch]'
                          closeButton={true}
                          onClose={() => setSubmitAlert('')}
                        >
                          {submitAlert}
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
                            setTrekkInnsendingSuccessfull(false)
                            await submitForm()
                          }}
                        >
                          Lagre og fortsett senere
                        </Button>

                        {etterlevelseDokumentasjon.risikoeiere.length > 0 && !pvkBlocksSending && (
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
                        )}
                      </div>
                    </div>
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
                    ) && <BodyLong>Det er ikke lagt til en oppsummering.</BodyLong>)}
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
                    {submitAlert !== '' && (
                      <Alert
                        variant='error'
                        className='my-5'
                        closeButton={true}
                        onClose={() => setSubmitAlert('')}
                      >
                        {submitAlert}
                      </Alert>
                    )}
                    <Button
                      className='mt-5'
                      variant='primary'
                      type='button'
                      onClick={async () => {
                        await submit(
                          {
                            ...etterlevelseDokumentasjon,
                            status: EEtterlevelseDokumentasjonStatus.UNDER_ARBEID,
                          },
                          true
                        )
                        setSaveSuccessfull(false)
                        setTrekkInnsendingSuccessfull(true)
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
