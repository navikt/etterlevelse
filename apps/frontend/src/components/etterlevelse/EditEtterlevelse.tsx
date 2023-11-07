import {Etterlevelse, EtterlevelseMetadata, EtterlevelseStatus, Krav, KRAV_FILTER_TYPE, KravQL, KravStatus} from '../../constants'
import {FormikProps} from 'formik'
import {createEtterlevelse, getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber, updateEtterlevelse} from '../../api/EtterlevelseApi'
import {Block} from 'baseui/block'
import Button from '../common/Button'
import React, {useEffect, useRef, useState} from 'react'
import {theme} from '../../util'
import {getKravByKravNumberAndVersion, KravId} from '../../api/KravApi'
import {kravNumView, query} from '../../pages/KravPage'
import {HeadingXLarge, HeadingXXLarge, LabelSmall, ParagraphMedium} from 'baseui/typography'
import {ettlevColors, maxPageWidth, responsivePaddingExtraLarge} from '../../util/theme'
import {user} from '../../services/User'
import {faChevronDown} from '@fortawesome/free-solid-svg-icons'
import {borderColor, borderRadius, borderStyle, borderWidth, marginAll, padding} from '../common/Style'
import {useQuery} from '@apollo/client'
import {informationIcon, warningAlert} from '../Images'
import CustomizedTabs from '../common/CustomizedTabs'
import {Tilbakemeldinger} from '../krav/tilbakemelding/Tilbakemelding'
import Etterlevelser from '../krav/Etterlevelser'
import {Markdown} from '../common/Markdown'
import {getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion, mapEtterlevelseMetadataToFormValue} from '../../api/EtterlevelseMetadataApi'
import TildeltPopoever from '../etterlevelseMetadata/TildeltPopover'
import CustomizedModal from '../common/CustomizedModal'
import {ampli} from '../../services/Amplitude'
import StatusView from '../common/StatusTag'
import {getPageWidth} from '../../util/pageWidth'
import {useNavigate, useParams} from 'react-router-dom'
import {getFilterType, Section} from '../../pages/EtterlevelseDokumentasjonPage'
import {syncEtterlevelseKriterieBegrunnelseWithKrav} from '../etterlevelseDokumentasjonTema/common/utils'
import EtterlevelseEditFields from './Edit/EtterlevelseEditFields'
import moment from 'moment'
import {Detail} from '@navikt/ds-react'

type EditEttlevProps = {
  temaName?: string
  etterlevelse: Etterlevelse
  kravId: KravId
  formRef?: React.Ref<any>
  documentEdit?: boolean
  etterlevelseDokumentasjonTitle?: string
  etterlevelseDokumentasjonId?: string
  etterlevelseNummer?: number
  varsleMelding?: string
  navigatePath: string
  setNavigatePath: (state: string) => void
  tab: Section
  setTab: (s: Section) => void
  tidligereEtterlevelser: Etterlevelse[] | undefined
  kravFilter: KRAV_FILTER_TYPE
}

export const EditEtterlevelse = ({
  temaName,
  kravId,
  etterlevelse,
  varsleMelding,
  formRef,
  documentEdit,
  etterlevelseDokumentasjonTitle,
  etterlevelseDokumentasjonId,
  etterlevelseNummer,
  navigatePath,
  setNavigatePath,
  tidligereEtterlevelser,
  tab,
  setTab,
  kravFilter,
}: EditEttlevProps) => {
  const params = useParams<{ id: string; tema: string; kravNummer: string; kravVersjon: string; filter: string }>()
  const { data, loading } = useQuery<{ kravById: KravQL }, KravId>(query, {
    variables: kravId,
    skip: !kravId.id && !kravId.kravNummer,
    fetchPolicy: 'no-cache',
  })
  const etterlevelserLoading = loading
  const [krav, setKrav] = useState<KravQL>()
  const [nyereKrav, setNyereKrav] = React.useState<Krav>()
  const [disableEdit, setDisableEdit] = React.useState<boolean>(false)
  const [editedEtterlevelse, setEditedEtterlevelse] = React.useState<Etterlevelse>()
  const etterlevelseFormRef: React.Ref<FormikProps<Etterlevelse> | undefined> = useRef()
  const [pageWidth, setPageWidth] = useState<number>(1276)

  const [etterlevelseMetadata, setEtterlevelseMetadata] = useState<EtterlevelseMetadata>(
    mapEtterlevelseMetadataToFormValue({
      id: 'ny',
      etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
      kravNummer: kravId.kravNummer,
      kravVersjon: kravId.kravVersjon,
    }),
  )

  const [isVersjonEndringerModalOpen, setIsVersjonEndringerModalOpen] = React.useState<boolean>(false)

  const [isAlertUnsavedModalOpen, setIsAlertUnsavedModalOpen] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      etterlevelseDokumentasjonId &&
        kravId.kravNummer &&
        getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion(etterlevelseDokumentasjonId, kravId.kravNummer, kravId.kravVersjon).then((resp) => {
          if (resp.content.length) {
            setEtterlevelseMetadata(resp.content[0])
          } else {
            setEtterlevelseMetadata(
              mapEtterlevelseMetadataToFormValue({
                id: 'ny',
                etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
                kravNummer: kravId.kravNummer,
                kravVersjon: kravId.kravVersjon,
              }),
            )
          }
        })
    })()
  }, [])

  useEffect(() => {
    const reportWindowSize = () => {
      setPageWidth(getPageWidth())
    }
    window.onload = reportWindowSize
    window.onresize = reportWindowSize
  })

  const submit = async (etterlevelse: Etterlevelse) => {
    const mutatedEtterlevelse = {
      ...etterlevelse,
      fristForFerdigstillelse: etterlevelse.status !== EtterlevelseStatus.OPPFYLLES_SENERE ? '' : etterlevelse.fristForFerdigstillelse,
      suksesskriterieBegrunnelser: syncEtterlevelseKriterieBegrunnelseWithKrav(etterlevelse, krav),
    }

    //double check if etterlevelse already exist before submitting
    let existingEtterlevelseId = ''
    if (etterlevelseDokumentasjonId && krav) {
      const etterlevelseList = (await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(etterlevelseDokumentasjonId, krav.kravNummer)).content.filter(
        (e) => e.kravVersjon === krav.kravVersjon,
      )
      if (etterlevelseList.length) {
        existingEtterlevelseId = etterlevelseList[0].id
        mutatedEtterlevelse.id = etterlevelseList[0].id
      }
    }

    if (etterlevelse.id || existingEtterlevelseId) {
      await updateEtterlevelse(mutatedEtterlevelse).then(() => navigate(`/dokumentasjon/${etterlevelseDokumentasjonId}`))
    } else {
      await createEtterlevelse(mutatedEtterlevelse).then(() => {
        navigate(`/dokumentasjon/${etterlevelseDokumentasjonId}`)
      })
    }
  }

  useEffect(() => {
    if (data?.kravById) {
      setKrav(data.kravById)
      getKravByKravNumberAndVersion(data.kravById.kravNummer, data.kravById.kravVersjon + 1).then((krav) => {
        if (krav && krav.status === KravStatus.AKTIV) setNyereKrav(krav)
      })
    }
  }, [data])

  useEffect(() => {
    if (nyereKrav && !user.isAdmin()) {
      setDisableEdit(true)
    }
  }, [nyereKrav])

  return (
    <Block width="100%">
      {krav && (
        <Block
          width="100%"
          $style={{
            ...borderWidth('1px'),
            ...borderStyle('solid'),
            ...borderColor(ettlevColors.green800),
          }}
        >
          <Block backgroundColor={ettlevColors.green800} paddingTop="32px" paddingBottom="32px">
            <Block paddingLeft="200px" paddingRight="200px">
              <Block display={'flex'}>
                <ParagraphMedium
                  $style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    color: ettlevColors.white,
                  }}
                >
                  {temaName} / {kravNumView(krav)}
                </ParagraphMedium>
                {kravFilter !== KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                  <StatusView status={kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV ? 'Utgått' : 'Bortfiltrert'}/>
                )}
              </Block>
              <HeadingXXLarge $style={{ marginTop: '0px', marginBottom: '0px', color: ettlevColors.white }}>{krav.navn}</HeadingXXLarge>
              {krav.aktivertDato !== null && (
                <Detail className="text-white">
                  {krav.kravVersjon > 1
                    ? `Ny versjon av kravet ble publisert ${moment(krav.aktivertDato).format('ll')}`
                    : `Kravet ble opprettet ${moment(krav.aktivertDato).format('ll')}`}
                </Detail>
              )}
              {kravFilter === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV && (
                <ParagraphMedium
                  $style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    paddingBottom: '32px',
                    color: ettlevColors.white,
                    lineHeight: '22px',
                    maxWidth: '650px',
                  }}
                >
                  <strong>Kravet er bortfiltrert og derfor ikke relevant.</strong>
                </ParagraphMedium>
              )}

              {kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV && (
                <ParagraphMedium
                  $style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    paddingBottom: '32px',
                    color: ettlevColors.white,
                    lineHeight: '22px',
                    maxWidth: '650px',
                  }}
                >
                  <strong>Kravet er utgått.</strong> Dere skal ikke dokumentere ny etterlevelse på dette kravet.
                </ParagraphMedium>
              )}

              {tidligereEtterlevelser && tidligereEtterlevelser.length >= 1 && kravFilter !== KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV && (
                <Block
                  width="fit-content"
                  display="flex"
                  backgroundColor="transparent"
                  $style={{
                    marginTop: '16px',
                  }}
                >
                  {etterlevelse.id === '' && (
                    <>
                      <img
                        src={warningAlert}
                        alt="warning icon"
                        width="24px"
                        height="24px"
                        style={{
                          marginRight: '5px',
                        }}
                      />
                      <ParagraphMedium
                        $style={{
                          lineHeight: '22px',
                          marginTop: '0px',
                          marginBottom: '0px',
                          fontWeight: 600,
                          color: ettlevColors.white,
                        }}
                      >
                        Dette er en ny versjon.
                      </ParagraphMedium>
                    </>
                  )}
                  {krav.versjonEndringer && (
                    <Button
                      type="button"
                      kind="underline-hover"
                      $style={{
                        marginLeft: '2px',
                        ':hover': { textDecoration: 'none' },
                      }}
                      onClick={() => setIsVersjonEndringerModalOpen(true)}
                    >
                      <ParagraphMedium
                        $style={{
                          lineHeight: '22px',
                          marginTop: '0px',
                          marginBottom: '0px',
                          fontWeight: 600,
                          color: ettlevColors.white,
                          textDecoration: 'underline',
                        }}
                      >
                        Se hva som er nytt fra forrige versjon.
                      </ParagraphMedium>
                    </Button>
                  )}
                </Block>
              )}

              {varsleMelding && (
                <Block
                  width="fit-content"
                  display="flex"
                  backgroundColor={'#E5F0F7'}
                  $style={{
                    ...padding('12px', '16px'),
                    ...borderColor('#005B82'),
                    ...borderWidth('1px'),
                    ...borderStyle('solid'),
                    ...borderRadius('4px'),
                    marginTop: '16px',
                  }}
                >
                  <img src={informationIcon} alt="information icon" width={'24px'} height={'24px'} />
                  <ParagraphMedium marginLeft={theme.sizing.scale500} marginTop="0px" marginBottom="0px">
                    {varsleMelding}
                  </ParagraphMedium>
                </Block>
              )}

              {kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                <Block display="flex" justifyContent="flex-start" alignItems="center" marginTop="32px">
                  <LabelSmall $style={{ color: ettlevColors.white, fontSize: '18px', lineHeight: '14px', textAlign: 'right' }}>
                    Tildelt:{' '}
                    {etterlevelseMetadata && etterlevelseMetadata.tildeltMed && etterlevelseMetadata.tildeltMed.length >= 1 ? etterlevelseMetadata.tildeltMed[0] : 'Ikke tildelt'}
                  </LabelSmall>
                  <TildeltPopoever
                    etterlevelseMetadata={etterlevelseMetadata}
                    setEtterlevelseMetadata={setEtterlevelseMetadata}
                    icon={faChevronDown}
                    iconColor={ettlevColors.white}
                  />
                </Block>
              )}
            </Block>
          </Block>
          <Block backgroundColor={ettlevColors.green100} paddingLeft="200px" paddingRight="200px">
            <HeadingXLarge $style={{ marginTop: '0px', marginBottom: '0px', paddingBottom: '32px', paddingTop: '41px' }}>Hensikten med kravet</HeadingXLarge>
            <Markdown p1 sources={Array.isArray(krav.hensikt) ? krav.hensikt : [krav.hensikt]} />
          </Block>

          <Block
            display={'flex'}
            justifyContent="center"
            width="100%"
            paddingTop="33px"
            $style={{
              background: `linear-gradient(top, ${ettlevColors.green100} 83px, ${ettlevColors.grey25} 0%)`,
            }}
          >
            <CustomizedTabs
              fontColor={ettlevColors.green600}
              activeColor={ettlevColors.green800}
              tabBackground={ettlevColors.green100}
              activeKey={tab}
              onChange={(k) => {
                ampli.logEvent('klikk', {
                  sidetittel: `B${etterlevelseNummer?.toString()} ${etterlevelseDokumentasjonTitle?.toString()}`,
                  section: `K${kravId.kravNummer}.${kravId.kravVersjon}`,
                  title: k.activeKey.toString(),
                  type: 'tab',
                })
                if (k.activeKey !== 'dokumentasjon' && etterlevelseFormRef.current && etterlevelseFormRef.current.values) {
                  setEditedEtterlevelse(etterlevelseFormRef.current.values)
                }
                setTab(k.activeKey as Section)
              }}
              overrides={{
                Root: {
                  style: {
                    width: '100%',
                  },
                },
                TabList: {
                  style: {
                    width: '100%',
                    paddingLeft: pageWidth <= 960 ? '16px' : '200px',
                    paddingRight: pageWidth <= 960 ? '16px' : '200px',
                    marginLeft: '0px',
                    marginRight: '0px',
                  },
                },
              }}
              tabs={[
                {
                  title: 'Dokumentasjon',
                  key: 'dokumentasjon',
                  content: (
                    <EtterlevelseEditFields
                      viewMode={kravFilter === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV ? true : false}
                      kravFilter={kravFilter}
                      krav={krav}
                      etterlevelse={etterlevelse}
                      submit={submit}
                      formRef={etterlevelseFormRef}
                      varsleMelding={varsleMelding}
                      disableEdit={disableEdit}
                      documentEdit={documentEdit}
                      close={() => {
                        setTimeout(() => navigate(`/dokumentasjon/${etterlevelseDokumentasjonId}`), 1)
                      }}
                      setIsAlertUnsavedModalOpen={setIsAlertUnsavedModalOpen}
                      isAlertUnsavedModalOpen={isAlertUnsavedModalOpen}
                      navigatePath={navigatePath}
                      setNavigatePath={setNavigatePath}
                      editedEtterlevelse={editedEtterlevelse}
                      tidligereEtterlevelser={tidligereEtterlevelser}
                      etterlevelseMetadata={etterlevelseMetadata}
                      setEtterlevelseMetadata={setEtterlevelseMetadata}
                    />
                  ),
                },
                {
                  title: 'Hvordan har andre gjort det?',
                  key: 'etterlevelser',
                  content: (
                    <Block display={'flex'} justifyContent="center" width="100%" paddingLeft="200px" paddingRight="200px">
                      <Etterlevelser loading={etterlevelserLoading} krav={krav} modalVersion />
                    </Block>
                  ),
                },
                {
                  title: 'Spørsmål og svar',
                  key: 'tilbakemeldinger',
                  content: (
                    <Block display={'flex'} justifyContent="center" width="100%" paddingLeft="200px" paddingRight="200px">
                      <Tilbakemeldinger krav={krav} hasKravExpired={false} />
                    </Block>
                  ),
                },
              ]}
            />
          </Block>

          <CustomizedModal
            onClose={() => setIsVersjonEndringerModalOpen(false)}
            isOpen={isVersjonEndringerModalOpen}
            size="full"
            closeIconColor={ettlevColors.white}
            closeIconHoverColor={ettlevColors.green100}
            overrides={{
              Dialog: {
                style: {
                  ...borderRadius('0px'),
                  ...marginAll('0px'),
                  width: '100%',
                  maxWidth: maxPageWidth,
                },
              },
            }}
          >
            <Block width="100%">
              <Block
                paddingTop="120px"
                paddingBottom="40px"
                backgroundColor={ettlevColors.green800}
                paddingLeft={responsivePaddingExtraLarge}
                paddingRight={responsivePaddingExtraLarge}
              >
                <LabelSmall color={ettlevColors.white}>
                  K{krav.kravNummer}.{krav.kravVersjon}
                </LabelSmall>
                <HeadingXXLarge marginTop="0px" marginBottom="0px" color={ettlevColors.white}>
                  {krav.navn}
                </HeadingXXLarge>
              </Block>
              <Block marginBottom="55px" marginTop="40px" paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
                <Block minHeight="300px">
                  <HeadingXLarge marginTop="0px" marginBottom="24px">
                    Dette er nytt fra forrige versjon
                  </HeadingXLarge>
                  <Markdown source={krav.versjonEndringer} />
                </Block>
                <Block display="flex" justifyContent="flex-end" width="100%" marginTop="38px">
                  <Button onClick={() => setIsVersjonEndringerModalOpen(false)}>Lukk visning</Button>
                </Block>
              </Block>
            </Block>
          </CustomizedModal>
        </Block>
      )}
    </Block>
  )
}
