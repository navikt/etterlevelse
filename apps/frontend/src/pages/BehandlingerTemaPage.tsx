import React, { useEffect, useState } from 'react'
import { Block, Display } from 'baseui/block'
import { useParams } from 'react-router-dom'
import { H1, H2, Label3, Paragraph2, Paragraph4 } from 'baseui/typography'
import { ettlevColors, maxPageWidth, theme } from '../util/theme'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import RouteLink, { urlForObject } from '../components/common/RouteLink'
import { useBehandling } from '../api/BehandlingApi'
import { Layout2 } from '../components/scaffold/Page'
import { Etterlevelse, EtterlevelseStatus, KravEtterlevelseData, KravQL, PageResponse } from '../constants'
import { arkPennIcon, crossIcon } from '../components/Images'
import { behandlingKravQuery } from '../components/behandling/ViewBehandling'
import { useQuery } from '@apollo/client'
import { CustomizedAccordion, CustomizedPanel, CustomPanelDivider } from '../components/common/CustomizedAccordion'
import CustomizedModal from '../components/common/CustomizedModal'
import { Spinner } from '../components/common/Spinner'
import { useEtterlevelse } from '../api/EtterlevelseApi'
import { EditEtterlevelse } from '../components/etterlevelse/EditEtterlevelse'
import { kravFullQuery, KravId } from '../api/KravApi'
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

const responsiveBreakPoints: Responsive<Display> = ['block', 'block', 'block', 'flex', 'flex', 'flex']

const mapEtterlevelseData = (etterlevelse?: Etterlevelse) => ({
  etterlevelseId: etterlevelse?.id,
  etterleves: !!etterlevelse?.etterleves,
  frist: etterlevelse?.fristForFerdigstillelse,
  etterlevelseStatus: etterlevelse?.status,
  gammelVersjon: false,
})

export const BehandlingerTemaPage = () => {
  const params = useParams<{ id?: string; tema?: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema)
  const [behandling, setBehandling] = useBehandling(params.id)
  const lover = codelist.getCodesForTema(temaData?.code).map((c) => c.code)
  const variables = { behandlingId: params.id, lover: lover }
  const { data: rawData, loading } = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables,
    skip: !params.id || !lover.length,
  })

  const [kravData, setKravData] = useState<KravEtterlevelseData[]>([])

  const [utfyltKrav, setUtfyltKrav] = useState<KravEtterlevelseData[]>([])
  const [underArbeidKrav, setUnderArbeidKrav] = useState<KravEtterlevelseData[]>([])
  const [skalUtfyllesKrav, setSkalUtfyllesKrav] = useState<KravEtterlevelseData[]>([])

  const [edit, setEdit] = useState<string | undefined>()
  const [kravId, setKravId] = useState<KravId | undefined>()

  useEffect(() => {
    ;(async () => {
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
    setUtfyltKrav(kravData.filter((k) => k.etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT || k.etterlevelseStatus === EtterlevelseStatus.IKKE_RELEVANT))
    setUnderArbeidKrav(
      kravData.filter(
        (k) =>
          k.etterlevelseStatus === EtterlevelseStatus.OPPFYLLES_SENERE ||
          k.etterlevelseStatus === EtterlevelseStatus.UNDER_REDIGERING ||
          k.etterlevelseStatus === EtterlevelseStatus.FERDIG,
      ),
    )
    setSkalUtfyllesKrav(kravData.filter((k) => k.etterlevelseStatus === undefined || null))
  }, [kravData])

  const getPercentageUtfylt = () => {
    let antallUtfylt = 0

    kravData.forEach((k) => {
      if (k.etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT && k.gammelVersjon !== true) {
        antallUtfylt += 1
      }
    })

    return antallUtfylt
  }

  const getMainHeader = () => (
    <Block justifyContent="space-between" marginBottom="32px">
      {temaData && behandling && (
        <>
          <Block>
            <H1 marginTop="0" color={ettlevColors.green800}>
              {temaData?.shortName}
            </H1>
            <RouteLink href={urlForObject(ListName.TEMA, temaData?.code)}>Les om tema</RouteLink>
          </Block>
          <Block marginTop={theme.sizing.scale900} flex="1" width="100%" display="flex">
            <Block>
              <Paragraph2 $style={{ marginTop: '0px', maxWidth: '700px' }} marginBottom={0}>
                <Label3>Behandling: </Label3>
                <a href={`${env.pollyBaseUrl}process/${behandling.id}`} style={{ color: ettlevColors.black }} target="_blank" rel="noopener noreferrer">
                  <span
                    style={{
                      display: 'inline-block',
                      paddingBottom: '1px',
                      borderBottom: '1px solid black',
                      marginRight: '5px',
                      width: '100%',
                    }}
                  >
                    B{behandling.nummer} - {behandling.overordnetFormaal.shortName}: {behandling.navn} <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </span>
                </a>
              </Paragraph2>
              {/*<Paragraph4 $style={{ lineHeight: '24px' }}>{behandling.overordnetFormaal.shortName}</Paragraph4>*/}
            </Block>
          </Block>
        </>
      )}
    </Block>
  )

  const getSecondaryHeader = () => (
    <Block width="100%" display={responsiveBreakPoints} alignItems="center" justifyContent="space-between">
      <Block display="flex" alignItems="center">
        <Block marginRight="30px">
          <img src={arkPennIcon} alt="test" height="32px" width="32px" />
        </Block>
        <Block>
          <H2 marginTop="0px" marginBottom="0px">
            Krav til utfylling
          </H2>
        </Block>
      </Block>

      <Block display="flex" alignItems="center">
        <Block display="flex" alignItems="baseline" marginRight="30px">
          <Paragraph2 $style={{ fontWeight: 900, fontSize: '32px', lineHeight: '0px' }} color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
            {kravData.filter((k) => k.gammelVersjon === false).length}
          </Paragraph2>
          <Paragraph2>krav</Paragraph2>
        </Block>
        <Block $style={{ border: '1px solid ' + ettlevColors.green50, background: '#102723' }} height="40px" />
        <Block display="flex" alignItems="baseline" marginLeft="30px">
          <Paragraph2 $style={{ fontWeight: 900, fontSize: '32px', lineHeight: '0px' }} color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
            {getPercentageUtfylt()}
          </Paragraph2>
          <Paragraph2> ferdig utfylt</Paragraph2>
        </Block>
      </Block>
    </Block>
  )

  const getKravList = (kravList: KravEtterlevelseData[], emptyMessage: string) => {
    if (kravList.length) {
      return kravList.map((k) => {
        return (
          <CustomPanelDivider key={`${k.navn}_${k.kravNummer}_${k.kravVersjon}`}>
            <KravCard krav={k} setEdit={setEdit} setKravId={setKravId} key={`${k.navn}_${k.kravNummer}_${k.kravVersjon}_card`} />
          </CustomPanelDivider>
        )
      })
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
    <Layout2
      headerBackgroundColor={ettlevColors.green100}
      mainHeader={getMainHeader()}
      secondaryHeaderBackgroundColor={ettlevColors.white}
      secondaryHeader={getSecondaryHeader()}
      childrenBackgroundColor={ettlevColors.grey25}
      currentPage={temaData?.shortName}
      breadcrumbPaths={breadcrumbPaths}
    >
      <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop="64px" marginBottom="64px">
        <CustomizedAccordion accordion={false}>
          <CustomizedPanel HeaderActiveBackgroundColor={ettlevColors.green50} title={<KravPanelHeader title={'Skal fylles ut'} kravData={skalUtfyllesKrav} />}>
            {getKravList(skalUtfyllesKrav, 'Ingen krav som skal fylles ut')}
          </CustomizedPanel>
          <CustomizedPanel HeaderActiveBackgroundColor={ettlevColors.green50} title={<KravPanelHeader title={'Under utfylling'} kravData={underArbeidKrav} />}>
            {getKravList(underArbeidKrav, 'Ingen krav under utfylling')}
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
  return (
    <Button
      kind="underline-hover"
      $style={{
        width: '100%',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingRight: '8px',
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
      <Block display="flex" width="100%">
        <Block marginLeft="24px">
          <Paragraph4 $style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '0px', marginTop: '0px', width: 'fit-content' }}>
            K{props.krav.kravNummer}.{props.krav.kravVersjon}
          </Paragraph4>
          <Label3 $style={{ fontSize: '18px', fontWeight: 600, alignContent: 'flex-start' }}>{props.krav.navn}</Label3>
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
          close={(e) => {
            props.close(e)
          }}
        />
      )}
    </Block>
  )
}
