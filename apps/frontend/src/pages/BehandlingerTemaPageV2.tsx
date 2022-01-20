import React, { useEffect, useState } from 'react'
import { Block, Display } from 'baseui/block'
import { useParams } from 'react-router-dom'
import { H1, H2, Label3, Paragraph2, Paragraph3, Paragraph4 } from 'baseui/typography'
import { ettlevColors, maxPageWidth, theme } from '../util/theme'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import RouteLink, { urlForObject } from '../components/common/RouteLink'
import { useBehandling } from '../api/BehandlingApi'
import { Layout2 } from '../components/scaffold/Page'
import { Etterlevelse, EtterlevelseStatus, KravEtterlevelseData, KravQL, PageResponse } from '../constants'
import { angleIcon, crossIcon, informationIcon, page2Icon } from '../components/Images'
import { behandlingKravQuery } from '../components/behandling/ViewBehandling'
import { useQuery } from '@apollo/client'
import { CustomizedAccordion, CustomizedPanel, CustomPanelDivider } from '../components/common/CustomizedAccordion'
import CustomizedModal from '../components/common/CustomizedModal'
import { Spinner } from '../components/common/Spinner'
import { useEtterlevelse } from '../api/EtterlevelseApi'
import { EditEtterlevelse } from '../components/etterlevelse/EditEtterlevelse'
import { getKravByKravNumberAndVersion, KravId } from '../api/KravApi'
import { borderStyle } from '../components/common/Style'
import { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import Button from '../components/common/Button'
import { Responsive } from 'baseui/theme'
import { KravPanelHeader } from '../components/behandling/KravPanelHeader'
import { sortKraverByPriority } from '../util/sort'
import _ from 'lodash'
import { getAllKravPriority } from '../api/KravPriorityApi'
import { env } from '../util/env'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CustomizedLink from '../components/common/CustomizedLink'
import StatusView from '../components/common/StatusTag'
import moment from 'moment'
import { Helmet } from 'react-helmet'
import CustomizedSelect from '../components/common/CustomizedSelect'
import { Option } from 'baseui/select'
import { user } from '../services/User'
import { Teams } from '../components/common/TeamName'
import { ExternalButton } from '../components/common/Button'
import { Behandling } from '../constants'
import { getMainHeader } from './BehandlingPage'

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

export const BehandlingerTemaPageV2 = () => {
  const params = useParams<{ id?: string; tema?: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema)
  const [behandling, setBehandling] = useBehandling(params.id)
  const lover = codelist.getCodesForTema(temaData?.code).map((c) => c.code)
  const variables = { behandlingId: params.id, lover: lover, gjeldendeKrav: false }
  const { data: rawData, loading } = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables,
    skip: !params.id || !lover.length,
  })

  const [kravData, setKravData] = useState<KravEtterlevelseData[]>([])

  const [utfyltKrav, setUtfyltKrav] = useState<KravEtterlevelseData[]>([])
  const [skalUtfyllesKrav, setSkalUtfyllesKrav] = useState<KravEtterlevelseData[]>([])

  const [edit, setEdit] = useState<string | undefined>()
  const [kravId, setKravId] = useState<KravId | undefined>()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const sortingOptions = [
    { label: 'Anbefalt rekkefølge', id: 'priority' },
    { label: 'Sist endret av meg', id: 'lastModified' },
  ]
  const [sorting, setSorting] = useState<readonly Option[]>([sortingOptions[0]])
  const [isTemaModalOpen, setIsTemaModalOpen] = useState<boolean>(false)

  useEffect(() => {
    ; (async () => {
      const allKravPriority = await getAllKravPriority()
      const kraver = _.cloneDeep(rawData?.krav.content) || []

      kraver.map((k) => {
        const priority = allKravPriority.filter((kp) => kp.kravNummer === k.kravNummer && kp.kravVersjon === k.kravVersjon)
        k.prioriteringsId = priority.length ? priority[0].prioriteringsId : ''
      })

      const sortedKrav = sortKraverByPriority<KravQL>(kraver, temaData?.shortName || '')
      const mapped = sortedKrav.map((krav) => {
        const etterlevelse = krav.etterlevelser.length ? krav.etterlevelser[0] : undefined
        return {
          kravNummer: krav.kravNummer,
          kravVersjon: krav.kravVersjon,
          navn: krav.navn,
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
      setKravData(mapped)
    })()
  }, [rawData])

  const update = (etterlevelse: Etterlevelse) => {
    setKravData(kravData.map((e) => (e.kravVersjon === etterlevelse.kravVersjon && e.kravNummer === etterlevelse.kravNummer ? { ...e, ...mapEtterlevelseData(etterlevelse) } : e)))
  }

  useEffect(() => {
    setUtfyltKrav(
      kravData.filter(
        (k) =>
          k.etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT ||
          k.etterlevelseStatus === EtterlevelseStatus.IKKE_RELEVANT ||
          k.etterlevelseStatus === EtterlevelseStatus.OPPFYLLES_SENERE,
      ),
    )
    setSkalUtfyllesKrav(
      kravData.filter(
        (k) => k.etterlevelseStatus === EtterlevelseStatus.UNDER_REDIGERING || k.etterlevelseStatus === EtterlevelseStatus.FERDIG || k.etterlevelseStatus === undefined || null,
      ),
    )
  }, [kravData])

  const getPercentageUtfylt = () => {
    let antallUtfylt = 0

    kravData.forEach((k) => {
      if (
        (k.etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT ||
          k.etterlevelseStatus === EtterlevelseStatus.OPPFYLLES_SENERE ||
          k.etterlevelseStatus === EtterlevelseStatus.IKKE_RELEVANT) &&
        k.gammelVersjon !== true
      ) {
        antallUtfylt += 1
      }
    })

    return antallUtfylt
  }

  const getSecondaryHeader = () => (
    <Block width="100%">
      <Block marginTop="19px">
        <RouteLink $style={{ fontSize: '18px', fontWheight: 400, LineHeigt: '22px', fontColor: ettlevColors.green600 }} href={`/behandling/${behandling?.id}`}>
          Krav til utfylling
        </RouteLink>
      </Block>
      <Block marginTop="6px" marginBottom="56px" display="flex" width="100%" alignItems="center" justifyContent="space-between">
        <Block display="flex" >
          <img src={angleIcon} alt="" />{' '}
          <Label3 marginLeft="12px" $style={{ fontSize: '18px', fontWeight: 600, lineHeight: '22px', color: ettlevColors.green600 }}>
            {temaData?.shortName}
          </Label3>
        </Block>
        <Block display="flex" justifyContent="flex-end">
          <Button
            startEnhancer={<img src={page2Icon} alt="Om personvern og ansvarlig for tema" />}
            size="compact"
            $style={{ fontSize: '18px', fontWeight: 600, lineHeight: '22px', color: ettlevColors.green600, ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' } }}
            kind={'tertiary'}
            onClick={() => setIsTemaModalOpen(true)}
            marginLeft
          >
            Om personvern og ansvarlig for tema
          </Button>
        </Block>
      </Block>
      <CustomizedModal
        onClose={() => setIsTemaModalOpen(false)}
      isOpen = {isTemaModalOpen}
      >

      </CustomizedModal>
    </Block>
  )

  const getKravList = (kravList: KravEtterlevelseData[], emptyMessage: string, sortingAvailable?: boolean) => {
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
        <Block $style={{ backgroundColor: 'white' }}>
          {isExpanded && sortingAvailable && (
            <Block marginBottom="12px" paddingLeft="20px" paddingRight="20px" width="100%" maxWidth="290px">
              <CustomizedSelect clearable={false} options={sortingOptions} value={sorting} onChange={(params) => setSorting(params.value)} />
            </Block>
          )}
          {sortedKravList.map((k) => {
            return (
              <CustomPanelDivider key={`${k.navn}_${k.kravNummer}_${k.kravVersjon}`}>
                <KravCard krav={k} setEdit={setEdit} setKravId={setKravId} key={`${k.navn}_${k.kravNummer}_${k.kravVersjon}_card`} />
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
    {
      pathName: `${behandling?.navn}`,
      href: '/behandling/' + behandling?.id,
    },
  ]

  return (
    <>
      {behandling && (
        <Layout2
          headerBackgroundColor="#F8F8F8"
          headerOverlap="31px"
          mainHeader={getMainHeader(behandling)}
          secondaryHeaderBackgroundColor={ettlevColors.green100}
          secondaryHeader={getSecondaryHeader()}
          childrenBackgroundColor={ettlevColors.grey25}
          currentPage={temaData?.shortName}
          breadcrumbPaths={breadcrumbPaths}
        >
          <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginBottom="64px">
            <CustomizedAccordion accordion={false}>
              <CustomizedPanel
                HeaderActiveBackgroundColor={ettlevColors.green50}
                onClick={() => setIsExpanded(!isExpanded)}
                title={<KravPanelHeader title={'Skal fylles ut'} kravData={skalUtfyllesKrav} />}
              >
                {getKravList(skalUtfyllesKrav, 'Ingen krav som skal fylles ut', true)}
              </CustomizedPanel>
              <CustomizedPanel HeaderActiveBackgroundColor={ettlevColors.green50} title={<KravPanelHeader title={'Ferdig utfylt'} kravData={utfyltKrav} />}>
                {getKravList(utfyltKrav, 'Ingen krav er ferdig utfylt')}
              </CustomizedPanel>
            </CustomizedAccordion>
            {edit && behandling && (
              <Block maxWidth={maxPageWidth}>
                <CustomizedModal isOpen={!!edit} onClose={() => setEdit(undefined)} overrides={{ Root: { props: { id: 'edit-etterlevelse-modal' } } }}>
                  <Block flex="1" backgroundColor={ettlevColors.green800}>
                    <Block paddingTop={theme.sizing.scale1200} paddingRight={theme.sizing.scale1000} paddingLeft={theme.sizing.scale1000}>
                      <Block display="flex" flex="1" justifyContent="flex-end">
                        <Button kind="tertiary" onClick={() => setEdit(undefined)} $style={{ ':hover': { backgroundColor: 'transparent' } }}>
                          <img src={crossIcon} alt="close" />
                        </Button>
                      </Block>
                    </Block>
                  </Block>

                  <EditModal
                    behandlingNavn={behandling.navn}
                    etterlevelseId={edit}
                    behandlingId={behandling.id}
                    behandlingformaal={behandling.overordnetFormaal.shortName || ''}
                    behandlingNummer={behandling.nummer || 0}
                    kravId={kravId}
                    close={(e) => {
                      setEdit(undefined)
                      e && update(e)
                    }}
                  />
                </CustomizedModal>
              </Block>
            )}
          </Block>
        </Layout2>
      )}
    </>
  )
}

const toKravId = (it: { kravVersjon: number; kravNummer: number }) => ({ kravNummer: it.kravNummer, kravVersjon: it.kravVersjon })

const EditModal = (props: {
  etterlevelseId: string
  behandlingId: string
  behandlingformaal: string
  kravId?: KravId
  close: (e?: Etterlevelse) => void
  behandlingNavn: string
  behandlingNummer: number
}) => {
  const [etterlevelse] = useEtterlevelse(props.etterlevelseId, props.behandlingId, props.kravId)
  if (!etterlevelse) return <Spinner size={theme.sizing.scale800} />

  return (
    <Block>
      {etterlevelse && (
        <KravView
          behandlingformaal={props.behandlingformaal}
          behandlingId={props.behandlingId}
          behandlingNavn={props.behandlingNavn}
          kravId={toKravId(etterlevelse)}
          etterlevelse={etterlevelse}
          close={props.close}
          behandlingNummer={props.behandlingNummer}
        />
      )}
    </Block>
  )
}

const KravCard = (props: { krav: KravEtterlevelseData; setEdit: Function; setKravId: Function }) => {
  const ferdigUtfylt =
    props.krav.etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT ||
    props.krav.etterlevelseStatus === EtterlevelseStatus.IKKE_RELEVANT ||
    props.krav.etterlevelseStatus === EtterlevelseStatus.OPPFYLLES_SENERE
  const [hover, setHover] = useState(false)
  return (
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
        ':hover': { backgroundColor: 'none' },
      }}
      onClick={() => {
        if (!props.krav.etterlevelseId) {
          props.setKravId(toKravId(props.krav))
          props.setEdit('ny')
        } else {
          props.setEdit(props.krav.etterlevelseId)
        }
      }}
    >
      <Block display="flex" justifyContent="center" alignItems="center" width="100%" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <Block marginLeft="24px">
          <Paragraph4 $style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '0px', marginTop: '0px', width: 'fit-content', textDecoration: hover ? 'underline' : 'none' }}>
            K{props.krav.kravNummer}.{props.krav.kravVersjon}
          </Paragraph4>
          <Label3 $style={{ fontSize: '18px', fontWeight: 600, alignContent: 'flex-start', textAlign: 'left', textDecoration: hover ? 'underline' : 'none' }}>
            {props.krav.navn}
          </Label3>
        </Block>
        <Block display="flex" justifyContent="flex-end" flex="1" width="100%">
          <Block width="350px" display="flex" justifyContent="flex-end" marginLeft="32px">
            <Block marginRight="31px">
              {props.krav.etterlevelseChangeStamp?.lastModifiedDate && (
                <Block width="100%" display="flex" justifyContent="flex-end">
                  <Paragraph4 $style={{ lineHeight: '19px', textAlign: 'right', marginTop: '0px', marginBottom: '0px', whiteSpace: 'nowrap' }}>
                    Sist utfylt: {moment(props.krav.etterlevelseChangeStamp?.lastModifiedDate).format('ll')}
                  </Paragraph4>
                </Block>
              )}
              {props.krav.frist && (
                <Block width="100%" display="flex" justifyContent="flex-end">
                  <Paragraph4 $style={{ lineHeight: '19px', textAlign: 'right', marginTop: '0px', marginBottom: '0px', whiteSpace: 'nowrap' }}>
                    Oppfylles senere: {moment(props.krav.frist).format('ll')}
                  </Paragraph4>
                </Block>
              )}
            </Block>
            <Block display="flex" width="100%" maxWidth="132px" justifyContent="flex-end">
              <StatusView
                status={ferdigUtfylt ? 'Ferdig utfylt' : props.krav.etterlevelseStatus ? 'Under utfylling' : 'Ikke påbegynt'}
                icon={props.krav.varselMelding ? <img src={informationIcon} alt="" width="16px" height="16px" /> : undefined}
                statusDisplay={{
                  background: ferdigUtfylt ? ettlevColors.green50 : props.krav.etterlevelseStatus ? '#FFECCC' : ettlevColors.white,
                  border: ferdigUtfylt ? ettlevColors.green400 : props.krav.etterlevelseStatus ? '#D47B00' : '#0B483F',
                }}
                background={props.krav.varselMelding ? ettlevColors.white : undefined}
              />
            </Block>
          </Block>
        </Block>
      </Block>
    </Button>
  )
}

const KravView = (props: {
  kravId: KravId
  etterlevelse: Etterlevelse
  close: Function
  behandlingNavn: string
  behandlingId: string
  behandlingformaal: string
  behandlingNummer: number
}) => {
  const [varsleMelding, setVarsleMelding] = useState('')

  useEffect(() => {
    ; (async () => {
      if (props.kravId.kravNummer && props.kravId.kravVersjon) {
        const krav = await getKravByKravNumberAndVersion(props.kravId.kravNummer, props.kravId.kravVersjon)
        if (krav) {
          setVarsleMelding(krav.varselMelding || '')
        }
      }
    })()
  }, [])
  return (
    <Block>
      {props.kravId && (
        <EditEtterlevelse
          behandlingNavn={props.behandlingNavn}
          behandlingId={props.behandlingId}
          behandlingformaal={props.behandlingformaal}
          kravId={props.kravId}
          etterlevelse={props.etterlevelse}
          behandlingNummer={props.behandlingNummer}
          varsleMelding={varsleMelding}
          close={(e) => {
            props.close(e)
          }}
        />
      )}
    </Block>
  )
}
