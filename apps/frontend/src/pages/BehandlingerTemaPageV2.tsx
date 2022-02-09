import React, {useEffect, useState} from 'react'
import {Block, Display} from 'baseui/block'
import {useNavigate, useParams} from 'react-router-dom'
import {H1, H3, Label3, Paragraph2, Paragraph4} from 'baseui/typography'
import {ettlevColors, maxPageWidth, responsivePaddingExtraLarge, theme} from '../util/theme'
import {codelist, ListName, TemaCode} from '../services/Codelist'
import {useBehandling} from '../api/BehandlingApi'
import {Layout2} from '../components/scaffold/Page'
import {Etterlevelse, EtterlevelseStatus, KravEtterlevelseData, KravQL, KravStatus, PageResponse} from '../constants'
import {angleIcon, page2Icon} from '../components/Images'
import {behandlingKravQuery} from '../components/behandling/ViewBehandling'
import {useQuery} from '@apollo/client'
import {CustomizedAccordion, CustomizedPanel, CustomPanelDivider} from '../components/common/CustomizedAccordion'
import CustomizedModal from '../components/common/CustomizedModal'
import {Spinner} from '../components/common/Spinner'
import {useEtterlevelse} from '../api/EtterlevelseApi'
import {getKravByKravNumberAndVersion, KravId} from '../api/KravApi'
import {borderRadius, borderStyle, marginAll, paddingAll} from '../components/common/Style'
import {breadcrumbPaths} from '../components/common/CustomizedBreadcrumbs'
import Button from '../components/common/Button'
import {Responsive} from 'baseui/theme'
import {KravPanelHeader} from '../components/behandling/KravPanelHeader'
import {sortKraverByPriority} from '../util/sort'
import _ from 'lodash'
import {getAllKravPriority} from '../api/KravPriorityApi'
import StatusView from '../components/common/StatusTag'
import moment from 'moment'
import {Helmet} from 'react-helmet'
import CustomizedSelect from '../components/common/CustomizedSelect'
import {Option} from 'baseui/select'
import {user} from '../services/User'
import {getMainHeader} from './BehandlingPage'
import {getTemaMainHeader} from './TemaPage'
import {EditEtterlevelseV2} from '../components/etterlevelse/EditEtterlevelseV2'
import {getEtterlevelseStatus, getEtterlevelseStatusLabelColor} from "../components/behandling/utils";
import {CustomizedPopoverButton} from "../components/common/CustomizedPopoverButton";
import {useEtterlevelseMetadata} from "../api/EtterlevelseMetadataApi";

const responsiveBreakPoints: Responsive<Display> = ['block', 'block', 'block', 'flex', 'flex', 'flex']
const responsiveDisplay: Responsive<Display> = ['block', 'block', 'block', 'block', 'flex', 'flex']

const mapEtterlevelseData = (etterlevelse?: Etterlevelse) => ({
  etterlevelseId: etterlevelse?.id,
  etterleves: !!etterlevelse?.etterleves,
  frist: etterlevelse?.fristForFerdigstillelse,
  etterlevelseStatus: etterlevelse?.status,
  etterlevelseChangeStamp: etterlevelse?.changeStamp,
  gammelVersjon: false,
})

export const isFerdigUtfylt = (status: EtterlevelseStatus | undefined) => {
  return status === EtterlevelseStatus.FERDIG_DOKUMENTERT || status === EtterlevelseStatus.OPPFYLLES_SENERE || status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
}

export type Section = 'dokumentasjon' | 'etterlevelser' | 'tilbakemeldinger'


export const BehandlingerTemaPageV2 = () => {
  const params = useParams<{ id?: string; tema?: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema)
  const irrelevantKrav = params?.tema?.charAt(0) === 'i' ? true : false
  const [behandling, setBehandling] = useBehandling(params.id)
  const lovListe = codelist.getCodesForTema(temaData?.code)
  const lover = lovListe.map((c) => c.code)
  const variables = {behandlingId: params.id, lover: lover, gjeldendeKrav: false, behandlingIrrevantKrav: irrelevantKrav}
  const {data: rawData, loading} = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables,
    skip: !params.id || !lover.length,
  })

  const {data: irrelevantData, loading: irrelevantDataLoading} = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables: {behandlingId: params.id, lover: lover, gjeldendeKrav: false, behandlingIrrevantKrav: !irrelevantKrav},
    skip: !params.id || !lover.length,
  })

  const [kravData, setKravData] = useState<KravEtterlevelseData[]>([])
  const [irrelevantKravData, setIrrelevantKravData] = useState<KravEtterlevelseData[]>([])

  const [utfyltKrav, setUtfyltKrav] = useState<KravEtterlevelseData[]>([])
  const [skalUtfyllesKrav, setSkalUtfyllesKrav] = useState<KravEtterlevelseData[]>([])

  const [activeEtterlevleseStatus, setActiveEtterlevelseStatus] = useState<EtterlevelseStatus | undefined>()

  const [edit, setEdit] = useState<string | undefined>()
  const [kravId, setKravId] = useState<KravId | undefined>()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const sortingOptions = [
    {label: 'Anbefalt rekkefølge', id: 'priority'},
    {label: 'Sist endret av meg', id: 'lastModified'},
  ]
  const [sorting, setSorting] = useState<readonly Option[]>([sortingOptions[0]])
  const [isTemaModalOpen, setIsTemaModalOpen] = useState<boolean>(false)
  const [isAlertUnsavedModalOpen, setIsAlertUnsavedModalOpen] = useState<boolean>(false)
  const [isNavigateButtonClicked, setIsNavigateButtonClicked] = useState<boolean>(false)
  const [tab, setTab] = useState<Section>('dokumentasjon')
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      const allKravPriority = await getAllKravPriority()
      const kraver = _.cloneDeep(rawData?.krav.content) || []
      const irrelevantKraver = _.cloneDeep(irrelevantData?.krav.content) || []

      kraver.map((k) => {
        const priority = allKravPriority.filter((kp) => kp.kravNummer === k.kravNummer && kp.kravVersjon === k.kravVersjon)
        k.prioriteringsId = priority.length ? priority[0].prioriteringsId : ''
      })

      irrelevantKraver.map((ik) => {
        const priority = allKravPriority.filter((kp) => kp.kravNummer === ik.kravNummer && kp.kravVersjon === ik.kravVersjon)
        ik.prioriteringsId = priority.length ? priority[0].prioriteringsId : ''
      })

      const sortedKrav = sortKraverByPriority<KravQL>(kraver, temaData?.shortName || '')
      const sortedIrrelevantKrav = sortKraverByPriority<KravQL>(irrelevantKraver, temaData?.shortName || '')

      const mapped = sortedKrav.map((krav) => {
        const etterlevelse = krav.etterlevelser.length ? krav.etterlevelser[0] : undefined
        return {
          kravNummer: krav.kravNummer,
          kravVersjon: krav.kravVersjon,
          navn: krav.navn,
          status: krav.status,
          suksesskriterier: krav.suksesskriterier,
          varselMelding: krav.varselMelding,
          prioriteringsId: krav.prioriteringsId,
          ...mapEtterlevelseData(etterlevelse),
        }
      })

      const irrelevantMapped = sortedIrrelevantKrav.map((krav) => {
        const etterlevelse = krav.etterlevelser.length ? krav.etterlevelser[0] : undefined
        return {
          kravNummer: krav.kravNummer,
          kravVersjon: krav.kravVersjon,
          navn: krav.navn,
          status: krav.status,
          suksesskriterier: krav.suksesskriterier,
          varselMelding: krav.varselMelding,
          prioriteringsId: krav.prioriteringsId,
          ...mapEtterlevelseData(etterlevelse),
        }
      })

      for (let index = mapped.length - 1; index > 0; index--) {
        if (mapped[index].kravNummer === mapped[index - 1].kravNummer && mapped[index - 1].etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
          mapped[index - 1].gammelVersjon = true
        } else if (mapped[index].kravNummer === mapped[index - 1].kravNummer && mapped[index - 1].etterlevelseStatus !== EtterlevelseStatus.FERDIG_DOKUMENTERT) {
          mapped.splice(index - 1, 1)
        }
      }

      setIrrelevantKravData(irrelevantMapped.filter((k) => k.etterlevelseStatus === undefined))

      setKravData(mapped.filter((k) => !(k.status === KravStatus.UTGAATT && k.etterlevelseStatus === undefined)))
    })()
  }, [rawData, irrelevantData])

  const update = (etterlevelse: Etterlevelse) => {
    setKravData(kravData.map((e) => (e.kravVersjon === etterlevelse.kravVersjon && e.kravNummer === etterlevelse.kravNummer ? {...e, ...mapEtterlevelseData(etterlevelse)} : e)))
  }

  useEffect(() => {
    setUtfyltKrav(kravData.filter((k) => isFerdigUtfylt(k.etterlevelseStatus)))
    setSkalUtfyllesKrav(
      kravData.filter(
        (k) => k.etterlevelseStatus === EtterlevelseStatus.IKKE_RELEVANT || k.etterlevelseStatus === EtterlevelseStatus.UNDER_REDIGERING || k.etterlevelseStatus === EtterlevelseStatus.FERDIG || k.etterlevelseStatus === undefined || null,
      ),
    )
  }, [kravData])

  const getPercentageUtfylt = () => {
    let antallUtfylt = 0

    kravData.forEach((k) => {
      if (isFerdigUtfylt(k.etterlevelseStatus) && k.gammelVersjon !== true) {
        antallUtfylt += 1
      }
    })

    return antallUtfylt
  }

  const getSecondaryHeader = () => (
    <Block width="100%">
      <Block marginTop="19px" width="fit-content">
        <Button
          kind="tertiary"
          onClick={() => {
            if (tab !== 'dokumentasjon') {
              setTab('dokumentasjon')
            }
            if (edit) {
              setIsAlertUnsavedModalOpen(true)
              setIsNavigateButtonClicked(true)
            } else {
              setEdit(undefined)
              navigate(`/behandling/${behandling?.id}`)
            }
          }}
          $style={{
            ...paddingAll('0px'),
            ':hover': {
              backgroundColor: 'inherit',
            },
            ':focus': {
              backgroundColor: 'inherit',
            },
          }}
        >
          <Label3
            $style={{
              fontSize: '18px',
              fontWeight: 'normal',
              lineHeight: '22px',
              color: ettlevColors.green600, textDecoration: 'underline',
              ':hover': {
                color: ettlevColors.green400
              }
            }}>
            Krav til utfylling
          </Label3>
        </Button>
      </Block>
      {edit && (
        <Block marginTop="8px">
          <img src={angleIcon} alt=""/>{' '}
          <Button
            kind="tertiary"
            onClick={() => {
              if (tab !== 'dokumentasjon') {
                setTab('dokumentasjon')
              }
              if (edit) {
                setIsAlertUnsavedModalOpen(true)
              } else {
                setEdit(undefined)
              }
            }}
            $style={{
              ...paddingAll('0px'),
              ':hover': {
                backgroundColor: 'inherit',
              },
              ':focus': {
                backgroundColor: 'inherit',
              },
            }}
          >
            <Label3
              marginLeft="12px"
              $style={{
                fontSize: '18px',
                fontWeight: 'normal',
                lineHeight: '22px',
                color: ettlevColors.green600, textDecoration: 'underline',
                ':hover': {
                  color: ettlevColors.green400
                }
              }}>
              {temaData?.shortName}
            </Label3>
          </Button>
        </Block>
      )}
      <Block
        marginTop="0px"
        marginBottom="56px"
        display="flex"
        width={edit ? 'calc(100% - 35px)' : '100%'}
        alignItems="center"
        justifyContent="center"
        marginLeft={edit ? '35px' : '0px'}
      >
        <Block display="flex" flex="1">
          <img src={angleIcon} alt=""/>{' '}
          <Label3 marginLeft="12px" $style={{fontSize: '18px', fontWeight: 600, lineHeight: '22px', color: ettlevColors.green600, whiteSpace: 'nowrap'}}>
            {edit ? (isFerdigUtfylt(activeEtterlevleseStatus) ? 'Ferdig utfylt' : 'Skal fylles ut') : temaData?.shortName}
          </Label3>
        </Block>
        <Block display="flex" justifyContent="flex-end" width="100%">
          <Button
            startEnhancer={<img src={page2Icon} alt="Om personvern og ansvarlig for tema"/>}
            size="compact"
            $style={{
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '22px',
              color: ettlevColors.green600,
              ':hover': {backgroundColor: 'transparent', textDecoration: 'underline 3px'},
            }}
            kind={'tertiary'}
            onClick={() => setIsTemaModalOpen(true)}
            marginLeft
          >
            Om {temaData?.shortName.toLocaleLowerCase()} og ansvarlig for tema
          </Button>
        </Block>
      </Block>
      {temaData && (
        <CustomizedModal
          onClose={() => setIsTemaModalOpen(false)}
          isOpen={isTemaModalOpen}
          size="full"
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
            <Block paddingTop="120px" paddingBottom="40px" backgroundColor={ettlevColors.green100} paddingLeft={responsivePaddingExtraLarge}
                   paddingRight={responsivePaddingExtraLarge}>
              <H1 marginTop="0px" marginBottom="0px">
                {temaData?.shortName}
              </H1>
            </Block>
            <Block marginBottom="55px" marginTop="40px" paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
              <Block>{getTemaMainHeader(temaData, lovListe, true, () => {
              }, true, true)}</Block>
              <Block display="flex" justifyContent="flex-end" width="100%" marginTop="38px">
                <Button onClick={() => setIsTemaModalOpen(false)}>Lukk visning</Button>
              </Block>
            </Block>
          </Block>
        </CustomizedModal>
      )}
    </Block>
  )

  const getKravList = (kravList: KravEtterlevelseData[], emptyMessage: string, sortingAvailable?: boolean, noStatus?: boolean) => {
    if (kravList.length) {
      let sortedKravList = _.cloneDeep(kravList)
      if (sortingAvailable && sorting[0].id === sortingOptions[1].id) {
        sortedKravList.sort((a, b) => {
          if (a.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent() && b.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent()) {
            return a.etterlevelseChangeStamp.lastModifiedDate < b.etterlevelseChangeStamp.lastModifiedDate ? 1 : -1
          } else if (a.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent() && b.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] !== user.getIdent()) {
            return -1
          } else if (a.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] !== user.getIdent() && b.etterlevelseChangeStamp?.lastModifiedBy.split(' ')[0] === user.getIdent()) {
            return 1
          } else {
            return 0
          }
        })
      } else {
        sortedKravList = kravList
      }

      return (
        <Block $style={{backgroundColor: 'white'}}>
          {isExpanded && sortingAvailable && (
            <Block marginBottom="12px" paddingLeft="20px" paddingRight="20px" width="100%" maxWidth="290px">
              <CustomizedSelect clearable={false} options={sortingOptions} value={sorting} onChange={(params) => setSorting(params.value)}/>
            </Block>
          )}
          {sortedKravList.map((k) => {
            return (
              <CustomPanelDivider key={`${k.navn}_${k.kravNummer}_${k.kravVersjon}`}>
                <KravCard
                  setActiveEtterlevelseStatus={setActiveEtterlevelseStatus}
                  krav={k}
                  setEdit={setEdit}
                  setKravId={setKravId}
                  key={`${k.navn}_${k.kravNummer}_${k.kravVersjon}_card`}
                  noStatus={noStatus}
                />
              </CustomPanelDivider>
            )
          })}
        </Block>
      )
    } else {
      return (
        <CustomPanelDivider>
          <Block display="flex" width="100%" marginLeft="24px">
            <Paragraph4> {emptyMessage}</Paragraph4>
          </Block>
        </CustomPanelDivider>
      )
    }
  }

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/behandlinger',
    },
  ]

  return (
    <>
      {behandling && (
        <Layout2
          headerBackgroundColor="#F8F8F8"
          headerOverlap="31px"
          mainHeader={getMainHeader(
            behandling,
            <Helmet>
              <meta charSet="utf-8"/>
              <title>
                {temaData?.shortName} B{behandling.nummer.toString()} {behandling.navn.toString()}
              </title>
            </Helmet>,
          )}
          secondaryHeaderBackgroundColor={ettlevColors.green100}
          secondaryHeader={getSecondaryHeader()}
          childrenBackgroundColor={ettlevColors.grey25}
          currentPage={behandling?.navn}
          breadcrumbPaths={breadcrumbPaths}
        >
          <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginBottom="64px">
            <Block width="100%" display={edit ? 'none' : 'block'}>
              <CustomizedAccordion accordion={false}>
                <CustomizedPanel
                  HeaderActiveBackgroundColor={ettlevColors.green50}
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={<KravPanelHeader title={'Skal fylles ut'} kravData={skalUtfyllesKrav}/>}
                >
                  {getKravList(skalUtfyllesKrav, 'Ingen krav som skal fylles ut', true)}
                </CustomizedPanel>
                <CustomizedPanel HeaderActiveBackgroundColor={ettlevColors.green50} title={<KravPanelHeader title={'Ferdig utfylt'} kravData={utfyltKrav}/>}>
                  {getKravList(utfyltKrav, 'Ingen krav er ferdig utfylt')}
                </CustomizedPanel>
              </CustomizedAccordion>
              {irrelevantKravData.length > 0 && (
                <Block marginTop="64px" width="100%">
                  <H3 marginTop="0px" marginBottom="16px">
                    Krav dere har filtrert bort
                  </H3>
                  <Paragraph2 marginTop="0px" marginBottom="25px" maxWidth="574px" width="100%">
                    Dere har filtrert bort krav under dette tema, som dere allikevel må kjenne til og vurdere om dere skal dokumentere på
                  </Paragraph2>
                  <Block width="100%">
                    <CustomizedAccordion>
                      <CustomizedPanel
                        HeaderActiveBackgroundColor={ettlevColors.green50}
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={<KravPanelHeader title="Må vurderes av dere" kravData={irrelevantKravData}/>}
                      >
                        {getKravList(irrelevantKravData, 'Ingen krav som skal fylles ut', false, true)}
                      </CustomizedPanel>
                    </CustomizedAccordion>
                  </Block>
                </Block>
              )}
            </Block>
            {edit && behandling && (
              <KravView
                behandlingNavn={behandling.navn}
                etterlevelseId={edit}
                behandlingId={behandling.id}
                behandlingformaal={behandling.overordnetFormaal.shortName || ''}
                behandlingNummer={behandling.nummer || 0}
                kravId={kravId}
                setIsAlertUnsavedModalOpen={setIsAlertUnsavedModalOpen}
                isAlertUnsavedModalOpen={isAlertUnsavedModalOpen}
                isNavigateButtonClicked={isNavigateButtonClicked}
                close={(e) => {
                  setEdit(undefined)
                  e && update(e)
                }}
                tab={tab}
                setTab={setTab}
              />
            )}
          </Block>
        </Layout2>
      )}
    </>
  )
}

const toKravId = (it: { kravVersjon: number; kravNummer: number }) => ({kravNummer: it.kravNummer, kravVersjon: it.kravVersjon})

const KravCard = (props: { krav: KravEtterlevelseData; setEdit: Function; setKravId: Function; noStatus?: boolean; setActiveEtterlevelseStatus: Function }) => {
  const ferdigUtfylt = isFerdigUtfylt(props.krav.etterlevelseStatus)
  const [hover, setHover] = useState(false)
  const etterLevelseMetadata = useEtterlevelseMetadata

  return (
    <Block display={"flex"}>
      <Block>
        <Button
          notBold
          $style={{
            width: '100%',
            paddingTop: '8px',
            paddingBottom: '8px',
            paddingRight: '24px',
            paddingLeft: '8px',
            display: 'flex',
            justifyContent: 'flex-start',
            backgroundColor: ettlevColors.white,
            ...borderStyle('hidden'),
            ':hover': {backgroundColor: 'none'},
          }}
          onClick={() => {
            if (!props.krav.etterlevelseId) {
              props.setKravId(toKravId(props.krav))
              props.setEdit('ny')
              props.setActiveEtterlevelseStatus(undefined)
            } else {
              props.setActiveEtterlevelseStatus(props.krav.etterlevelseStatus)
              props.setEdit(props.krav.etterlevelseId)
            }
          }}
        >
          <Block display="flex" justifyContent="center" alignItems="center" width="100%" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Block marginLeft="24px">
              <Paragraph4
                $style={{fontSize: '16px', lineHeight: '24px', marginBottom: '0px', marginTop: '0px', width: 'fit-content', textDecoration: hover ? 'underline' : 'none'}}>
                K{props.krav.kravNummer}.{props.krav.kravVersjon}
              </Paragraph4>
              <Label3 $style={{fontSize: '18px', fontWeight: 600, alignContent: 'flex-start', textAlign: 'left', textDecoration: hover ? 'underline' : 'none'}}>
                {props.krav.navn}
              </Label3>
            </Block>
            <Block display="flex" justifyContent="flex-end" flex="1" width="100%">
              <Block width="350px" display="flex" justifyContent="flex-end" marginLeft="32px">
                <Block display="flex" width="100%" maxWidth="220px" justifyContent="flex-end">
                  <StatusView
                    status={props.krav && props.krav.etterlevelseStatus ? getEtterlevelseStatus(props.krav) : 'Ikke påbegynt'}
                    statusDisplay={getEtterlevelseStatusLabelColor(props.krav)}
                    background={props.krav.varselMelding ? ettlevColors.white : undefined}
                  />
                </Block>
                <Block marginLeft="31px" maxWidth="140px" width="100%">
                  {props.krav.etterlevelseChangeStamp?.lastModifiedDate && (
                    <Block width="100%" display="flex" justifyContent="flex-end">
                      <Paragraph4 $style={{lineHeight: '19px', textAlign: 'right', marginTop: '0px', marginBottom: '0px', whiteSpace: 'nowrap'}}>
                        Sist utfylt: {moment(props.krav.etterlevelseChangeStamp?.lastModifiedDate).format('ll')}
                      </Paragraph4>
                    </Block>
                  )}
                </Block>
              </Block>
            </Block>
          </Block>
        </Button>
      </Block>
      <Block>
        <CustomizedPopoverButton/>
      </Block>
    </Block>
  )
}

const KravView = (props: {
  kravId?: KravId
  etterlevelseId: string
  close: (e?: Etterlevelse) => void
  behandlingNavn: string
  behandlingId: string
  behandlingformaal: string
  behandlingNummer: number
  setIsAlertUnsavedModalOpen: (state: boolean) => void
  isAlertUnsavedModalOpen: boolean
  isNavigateButtonClicked: boolean
  tab: Section
  setTab: (s: Section) => void
}) => {
  const [etterlevelse] = useEtterlevelse(props.etterlevelseId, props.behandlingId, props.kravId)
  const [varsleMelding, setVarsleMelding] = useState('')

  useEffect(() => {
    ;(async () => {
      if (etterlevelse) {
        const kravId = toKravId(etterlevelse)
        if (kravId.kravNummer && kravId.kravVersjon) {
          const krav = await getKravByKravNumberAndVersion(kravId.kravNummer, kravId.kravVersjon)
          if (krav) {
            setVarsleMelding(krav.varselMelding || '')
          }
        }
      }
    })()
  }, [])

  return (
    <Block width="100%">
      {!etterlevelse && (
        <Block width="100%" display="flex" justifyContent="center" marginTop="50px">
          <Spinner size={theme.sizing.scale1200}/>
        </Block>
      )}
      {etterlevelse && (
        <Block width="100%" display="flex" justifyContent="center">
          <EditEtterlevelseV2
            behandlingNavn={props.behandlingNavn}
            behandlingId={props.behandlingId}
            behandlingformaal={props.behandlingformaal}
            kravId={toKravId(etterlevelse)}
            etterlevelse={etterlevelse}
            behandlingNummer={props.behandlingNummer}
            varsleMelding={varsleMelding}
            close={(e) => {
              props.close(e)
            }}
            setIsAlertUnsavedModalOpen={props.setIsAlertUnsavedModalOpen}
            isAlertUnsavedModalOpen={props.isAlertUnsavedModalOpen}
            isNavigateButtonClicked={props.isNavigateButtonClicked}
            tab={props.tab}
            setTab={props.setTab}
          />
        </Block>
      )}
    </Block>
  )
}
