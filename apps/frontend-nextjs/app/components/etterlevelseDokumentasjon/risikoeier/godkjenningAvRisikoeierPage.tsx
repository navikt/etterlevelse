'use client'

import {
  etterlevelseDokumentasjonMapToFormVal,
  getEtterlevelseDokumentasjon,
  godkjennEtterlevelseDokumentasjon,
  useEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getAllKravPriorityList } from '@/api/kravPriorityList/kravPriorityListApi'
import {
  getPvkDokumentByEtterlevelseDokumentId,
  mapPvkDokumentToFormValue,
} from '@/api/pvkDokument/pvkDokumentApi'
import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { Markdown } from '@/components/common/markdown/markdown'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IBreadCrumbPath, IPageResponse } from '@/constants/commonConstants'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
  IEtterlevelseDokumentasjonStats,
  IKravTilstandHistorikk,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { EListName, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { getEtterlevelseDokumentasjonStatsQuery } from '@/query/etterlevelseDokumentasjon/etterlevelseDokumentasjonQuery'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import {
  filterEtterlevelseDokumentasjonStatsData,
  getKravForTema,
} from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { useQuery } from '@apollo/client/react'
import { Alert, BodyLong, Button, FormSummary, Heading, List } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useParams } from 'next/navigation'
import { useContext, useEffect, useMemo, useState } from 'react'
import EtterlevelsesDokumentasjonGodkjenningsHistorikk from './common/etterlevelsesDokumentasjonGodkjenningsHistorikk'

export const GodkjenningAvEtterlevelsesDokumentPage = () => {
  const params: Readonly<
    Partial<{
      etterlevelseDokumentasjonId?: string
    }>
  > = useParams<{ etterlevelseDokumentasjonId?: string }>()
  const codelist = useContext(CodelistContext)
  const temaListe: TTemaCode[] = codelist.utils.getCodes(EListName.TEMA) as TTemaCode[]

  const [
    etterlevelseDokumentasjon,
    setEtterlevelseDokumentasjon,
    isEtterlevelseDokumentasjonLoading,
  ] = useEtterlevelseDokumentasjon(params.etterlevelseDokumentasjonId)
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>(mapPvkDokumentToFormValue({}))
  const [allKravPriority, setAllKravPriority] = useState<IKravPriorityList[]>([])

  const variables: {
    etterlevelseDokumentasjonId: string | undefined
  } = { etterlevelseDokumentasjonId: params.etterlevelseDokumentasjonId }

  const { data: relevanteData, loading } = useQuery<{
    etterlevelseDokumentasjon: IPageResponse<{ stats: IEtterlevelseDokumentasjonStats }>
  }>(getEtterlevelseDokumentasjonStatsQuery, {
    variables,
    skip: !params.etterlevelseDokumentasjonId,
  })

  const [relevanteStats, utgaattStats] = filterEtterlevelseDokumentasjonStatsData(relevanteData)

  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
      pathName: `E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon?.title}`,
    },
  ]

  const [saveSuccessfull, setSaveSuccessfull] = useState<boolean>(false)

  const kravTilstandsHistorikk: IKravTilstandHistorikk[] = useMemo(() => {
    const tilstandHistorikk: IKravTilstandHistorikk[] = []

    if (allKravPriority.length !== 0) {
      temaListe.map((tema) => {
        const relevantStatsKravnummer = relevanteStats.map((k) => k.kravNummer)

        const filteredUtgaatKrav = utgaattStats.filter(
          ({ kravNummer }) => !relevantStatsKravnummer.includes(kravNummer)
        )

        const kravliste = getKravForTema({
          tema,
          kravliste: [...relevanteStats, ...filteredUtgaatKrav],
          allKravPriority,
          codelist,
        })

        const utfylteKrav = kravliste.filter(
          (krav) =>
            krav.etterlevelseStatus === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
            krav.etterlevelseStatus === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
        )

        const underArbeidKrav = kravliste.filter(
          (krav) =>
            krav.etterlevelseStatus === EEtterlevelseStatus.UNDER_REDIGERING ||
            krav.etterlevelseStatus === EEtterlevelseStatus.FERDIG
        )

        const underArbeidKriterie = []
        const oppfyltKriterie = []
        const ikkeOppfyltKriterie = []
        const ikkeRelevantKriteri = []

        kravliste.forEach((krav) => {
          if (
            krav.etterlevelseId !== null &&
            krav.etterlevelseSuksesskriterieBegrunnelser !== undefined &&
            krav.etterlevelseSuksesskriterieBegrunnelser.length !== 0
          ) {
            underArbeidKriterie.push(
              ...krav.etterlevelseSuksesskriterieBegrunnelser.filter(
                (begrunnelse) =>
                  begrunnelse.suksesskriterieStatus === ESuksesskriterieStatus.UNDER_ARBEID
              )
            )

            oppfyltKriterie.push(
              ...krav.etterlevelseSuksesskriterieBegrunnelser.filter(
                (begrunnelse) =>
                  begrunnelse.suksesskriterieStatus === ESuksesskriterieStatus.OPPFYLT
              )
            )

            ikkeOppfyltKriterie.push(
              ...krav.etterlevelseSuksesskriterieBegrunnelser.filter(
                (begrunnelse) =>
                  begrunnelse.suksesskriterieStatus === ESuksesskriterieStatus.IKKE_OPPFYLT
              )
            )

            ikkeRelevantKriteri.push(
              ...krav.etterlevelseSuksesskriterieBegrunnelser.filter(
                (begrunnelse) =>
                  begrunnelse.suksesskriterieStatus === ESuksesskriterieStatus.IKKE_RELEVANT
              )
            )
          }
        })

        tilstandHistorikk.push({
          tema: tema.shortName,
          antallKravUnderArbeid: underArbeidKrav.length,
          antallKravFerdigUtfylt: utfylteKrav.length,
          antallSuksesskriterieUnderArbeid: underArbeidKriterie.length,
          antallSuksesskriterieOppfylt: oppfyltKriterie.length,
          antallSuksesskriterieIkkeOppfylt: ikkeOppfyltKriterie.length,
          antallSuksesskriterieIkkeRelevant: ikkeRelevantKriteri.length,
        })
      })
    }
    return tilstandHistorikk
  }, [allKravPriority, temaListe, relevanteStats, utgaattStats])

  const submit = async (submitValues: IEtterlevelseDokumentasjon) => {
    await getEtterlevelseDokumentasjon(submitValues.id).then(async (response) => {
      const updatedEtterlevelseDokumentasjon = { ...response }
      updatedEtterlevelseDokumentasjon.status = submitValues.status
      updatedEtterlevelseDokumentasjon.meldingEtterlevelerTilRisikoeier =
        submitValues.meldingEtterlevelerTilRisikoeier

      await godkjennEtterlevelseDokumentasjon(
        updatedEtterlevelseDokumentasjon,
        kravTilstandsHistorikk
      ).then((resp) => {
        setEtterlevelseDokumentasjon(resp)
      })
    })
  }

  useEffect(() => {
    ;(async () => {
      if (!!etterlevelseDokumentasjon) {
        await getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id).then(
          setPvkDokument
        )
      }
    })()
  }, [etterlevelseDokumentasjon])

  useEffect(() => {
    ;(async () => {
      await getAllKravPriorityList().then((priority) => setAllKravPriority(priority))
    })()
  }, [])

  return (
    <PageLayout
      pageTitle='Godkjenn etterlevelsesdokument'
      currentPage='Godkjenn etterlevelsesdokument'
      breadcrumbPaths={breadcrumbPaths}
    >
      {isEtterlevelseDokumentasjonLoading && loading && <CenteredLoader />}
      {!isEtterlevelseDokumentasjonLoading && !loading && etterlevelseDokumentasjon && (
        <div className='max-w-[75ch]'>
          <Heading level='1' size='large' className='mb-10'>
            Godkjenn etterlevelsesdokument
          </Heading>

          {etterlevelseDokumentasjon.etterlevelseDokumentVersjon > 1 && (
            <EtterlevelsesDokumentasjonGodkjenningsHistorikk
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            />
          )}

          <FormSummary>
            <FormSummary.Header>
              <Heading level='2' size='small'>
                Oversikt over etterlevelsen
              </Heading>
            </FormSummary.Header>
            <FormSummary.Answers>
              {allKravPriority.length !== 0 &&
                kravTilstandsHistorikk.map((kravHistorikk) => {
                  return (
                    <FormSummary.Answer
                      key={
                        kravHistorikk.tema +
                        '_' +
                        etterlevelseDokumentasjon.etterlevelseDokumentVersjon
                      }
                    >
                      <FormSummary.Label>{kravHistorikk.tema}</FormSummary.Label>
                      <FormSummary.Value>
                        <FormSummary.Answers>
                          <FormSummary.Answer>
                            <FormSummary.Label>Krav</FormSummary.Label>
                            <FormSummary.Value>
                              {kravHistorikk.antallKravUnderArbeid} krav er under arbeid,{' '}
                              {kravHistorikk.antallKravFerdigUtfylt} er ferdig utfylt
                            </FormSummary.Value>
                          </FormSummary.Answer>
                          <FormSummary.Answer>
                            <FormSummary.Label>Suksesskriterier</FormSummary.Label>
                            <FormSummary.Value>
                              {kravHistorikk.antallSuksesskriterieUnderArbeid} suksesskriterier er
                              under arbeid, {kravHistorikk.antallSuksesskriterieOppfylt} er oppfylt,{' '}
                              {kravHistorikk.antallSuksesskriterieOppfylt} er ikke oppfylt,{' '}
                              {kravHistorikk.antallSuksesskriterieIkkeRelevant} er ikke relevant.
                            </FormSummary.Value>
                          </FormSummary.Answer>
                        </FormSummary.Answers>
                      </FormSummary.Value>
                    </FormSummary.Answer>
                  )
                })}

              <FormSummary.Answer>
                <FormSummary.Label>Behov for PVK</FormSummary.Label>
                <FormSummary.Value>
                  <FormSummary.Answers>
                    <FormSummary.Answer>
                      <FormSummary.Label>
                        Hvilken vurdering har dere kommet fram til?
                      </FormSummary.Label>
                      <FormSummary.Value>
                        {(pvkDokument.pvkVurdering === undefined ||
                          pvkDokument.pvkVurdering === EPvkVurdering.UNDEFINED) &&
                          'Ingen vurdering'}
                        {pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE &&
                          'Vi skal gjennomføre en PVK'}
                        {pvkDokument.pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE &&
                          'Vi skal ikke gjennomføre PVK'}
                      </FormSummary.Value>
                    </FormSummary.Answer>
                    <FormSummary.Answer>
                      <FormSummary.Label>Begrunn vurderingen deres</FormSummary.Label>
                      <FormSummary.Value>
                        {pvkDokument.pvkVurderingsBegrunnelse !== '' && (
                          <Markdown source={pvkDokument.pvkVurderingsBegrunnelse} />
                        )}
                        {pvkDokument.pvkVurderingsBegrunnelse === '' && 'Ingen begrunnelse'}
                      </FormSummary.Value>
                    </FormSummary.Answer>
                  </FormSummary.Answers>
                </FormSummary.Value>
              </FormSummary.Answer>
            </FormSummary.Answers>
          </FormSummary>

          <div className='mt-7 mb-9'>
            <Heading level='3' size='xsmall' className='mb-5'>
              Etterleverens notat til risikoeier
            </Heading>
            <DataTextWrapper>
              <Markdown source={etterlevelseDokumentasjon.meldingEtterlevelerTilRisikoeier} />
            </DataTextWrapper>
          </div>

          <div className='mt-7 mb-9'>
            <Heading level='2' size='small' className='mb-5'>
              Godkjenn etterlevelsesdokument
            </Heading>

            <BodyLong>
              Det er bedt om risikoeiers godkjenning av denne etterlevelsesdokumentasjonen. Dersom
              du godkjenner vil følgende inngå i godkjenningen:
            </BodyLong>

            <List as='ul' className='my-7'>
              <List.Item>
                Dokumentasjon av alle etterlevelseskrav som er en del av etterlevelsesdokumentet på
                godkjenningstidspunktet. Dette gjelder også etterlevelseskrav som ikke er
                ferdigstilt.
              </List.Item>
              <List.Item>
                Svar på om det er nødvendig å gjennomføre PVK. Dette gjelder kun hvis det er huket
                av under Dokumentegenskaper for at personopplysninger behandles.
              </List.Item>

              <BodyLong>
                Det er kun etterlevelsesdokumentet som godkjennes og arkiveres i Public 360. Dersom
                det finnes et PVK-dokument, vil dette ikke være en del av denne godkjenningen.
              </BodyLong>
            </List>
          </div>

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
                    label='Risikoeiers begrunnelse for godkjenningen'
                    name='meldingRisikoeierTilEtterleveler'
                    markdown
                  />
                </div>

                {etterlevelseDokumentasjon.risikoeiere.length > 0 && (
                  <div>
                    {saveSuccessfull && (
                      <div className='my-5'>
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

                    <div className='flex items-center mt-5 gap-2'>
                      <Button
                        type='button'
                        variant='secondary'
                        onClick={async () => {
                          await setFieldValue(
                            'status',
                            EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
                          )
                          await submitForm()
                          setSaveSuccessfull(true)
                        }}
                      >
                        Lagre og fortsett senere
                      </Button>

                      <Button
                        type='button'
                        variant='primary'
                        onClick={async () => {
                          await submitForm()
                        }}
                      >
                        Godkjenn og arkiver i Public360
                      </Button>
                    </div>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      )}
    </PageLayout>
  )
}
export default GodkjenningAvEtterlevelsesDokumentPage
