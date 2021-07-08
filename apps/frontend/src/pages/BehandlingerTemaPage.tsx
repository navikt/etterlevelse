import React, { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { useParams } from 'react-router-dom'
import { H1, H2, HeadingLarge, Label3, Paragraph2, Paragraph4 } from 'baseui/typography'
import { ettlevColors, maxPageWidth, theme } from '../util/theme'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import RouteLink, { urlForObject } from '../components/common/RouteLink'
import { useBehandling } from '../api/BehandlingApi'
import { ObjectType } from '../components/admin/audit/AuditTypes'
import { Layout2 } from '../components/scaffold/Page'
import { Etterlevelse, EtterlevelseStatus, KravQL, PageResponse, Suksesskriterie } from '../constants'
import { arkPennIcon, circlePencilIcon, crossIcon } from '../components/Images'
import { behandlingKravQuery } from '../components/behandling/ViewBehandling'
import { useQuery } from '@apollo/client'
import { CustomizedAccordion, CustomizedPanel } from '../components/common/CustomizedAccordion'
import { Card } from 'baseui/card'
import { Button, KIND } from 'baseui/button'
import CustomizedModal from '../components/common/CustomizedModal'
import { Spinner } from 'baseui/icon'
import { useEtterlevelse } from '../api/EtterlevelseApi'
import { EditEtterlevelse } from '../components/etterlevelse/EditEtterlevelse'
import { kravFullQuery, KravId } from '../api/KravApi'
import { borderWidth } from '../components/common/Style'

type KravEtterlevelseData = {
  kravNummer: number
  kravVersjon: number
  navn: string
  etterlevelseId?: string
  etterleves: boolean
  frist?: string
  etterlevelseStatus?: EtterlevelseStatus
  suksesskriterier: Suksesskriterie[]
}

const mapEtterlevelseData = (etterlevelse?: Etterlevelse) => ({
  etterlevelseId: etterlevelse?.id,
  etterleves: !!etterlevelse?.etterleves,
  frist: etterlevelse?.fristForFerdigstillelse,
  etterlevelseStatus: etterlevelse?.status,
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
    const mapped = (rawData?.krav.content || []).map((krav) => {
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
      if (mapped[index].kravNummer === mapped[index - 1].kravNummer) {
        mapped.splice(index - 1, 1)
      }
    }

    setKravData(mapped)
  }, [rawData])

  const update = (etterlevelse: Etterlevelse) => {
    setKravData(kravData.map((e) => (e.kravVersjon === etterlevelse.kravVersjon && e.kravNummer === etterlevelse.kravNummer ? { ...e, ...mapEtterlevelseData(etterlevelse) } : e)))
  }

  useEffect(() => {
    setUtfyltKrav(kravData.filter((k) => k.etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT))
    setUnderArbeidKrav(
      kravData.filter(
        (k) =>
          k.etterlevelseStatus === EtterlevelseStatus.OPPFYLLES_SENERE ||
          k.etterlevelseStatus === EtterlevelseStatus.UNDER_REDIGERING ||
          k.etterlevelseStatus === EtterlevelseStatus.FERDIG ||
          k.etterlevelseStatus === EtterlevelseStatus.IKKE_RELEVANT,
      ),
    )
    setSkalUtfyllesKrav(kravData.filter((k) => k.etterlevelseStatus === undefined || null))
  }, [kravData])

  const getPercentageUtfylt = () => {
    let antallUtfylt = 0

    kravData.forEach((k) => {
      if (k.etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
        antallUtfylt += 1
      }
    })

    return antallUtfylt
  }

  const getMainHeader = () => (
    <Block display="flex" justifyContent="space-between" marginBottom="60px">
      {temaData && behandling && (
        <>
          <Block marginTop={theme.sizing.scale1200}>
            <Label3 color={ettlevColors.green600}>DOKUMENTERE ETTERLEVELSE</Label3>
            <H1 marginTop="0" color={ettlevColors.green800}>
              {temaData?.shortName}
            </H1>
            <RouteLink href={urlForObject(ListName.TEMA, temaData?.code)}>Les om tema</RouteLink>
          </Block>

          <Block marginTop={theme.sizing.scale1200}>
            <Block padding="5px">
              <RouteLink href={urlForObject(ObjectType.Behandling, behandling.id)}>{behandling.navn}</RouteLink>
              <Paragraph4 $style={{ lineHeight: '24px' }}>{behandling.overordnetFormaal.shortName}</Paragraph4>
            </Block>
          </Block>
        </>
      )}
    </Block>
  )

  const getSecondaryHeader = () => (
    <Block width="100%" height="100px" maxHeight="100px" display="flex" alignItems="center" justifyContent="space-between">
      <Block display="flex" alignItems="center">
        <Block marginRight="30px">
          <img src={arkPennIcon} alt="test" height="50px" width="40px" />
        </Block>
        <Block>
          <Paragraph2 marginBottom="0px" marginTop="0px">
            Steg 2 av 3
          </Paragraph2>
          <H2 marginTop="0px" marginBottom="0px">
            Krav til utfylling
          </H2>
        </Block>
      </Block>

      <Block display="flex" alignItems="center">
        <Block display="flex" alignItems="baseline" marginRight="30px">
          <H1 color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
            {kravData.length}
          </H1>
          <Paragraph2>krav</Paragraph2>
        </Block>
        <Block $style={{ border: '1px solid ' + ettlevColors.green50, background: '#102723' }} height="40px" />
        <Block display="flex" alignItems="baseline" marginLeft="30px">
          <H1 color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
            {getPercentageUtfylt()}
          </H1>
          <Paragraph2> ferdig utfylt</Paragraph2>
        </Block>
      </Block>
    </Block>
  )

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.green100}
      mainHeader={getMainHeader()}
      secondaryHeaderBackgroundColor={ettlevColors.white}
      secondaryHeader={getSecondaryHeader()}
      childrenBackgroundColor={ettlevColors.grey25}
      backBtnUrl={`/behandling/${params.id}`}
    >
      <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop="87px" marginBottom="87px">
        <CustomizedAccordion accordion={false}>
          <CustomizedPanel HeaderActiveBackgroundColor={ettlevColors.green50} title={<PanelHeader title={'Skal fylles ut'} kravData={skalUtfyllesKrav} />}>
            {skalUtfyllesKrav.map((k) => {
              return <KravCard key={`${k.navn}_${k.kravNummer}`} krav={k} setEdit={setEdit} setKravId={setKravId} />
            })}
          </CustomizedPanel>
          <CustomizedPanel HeaderActiveBackgroundColor={ettlevColors.green50} title={<PanelHeader title={'Under utfylling'} kravData={underArbeidKrav} />}>
            {underArbeidKrav.map((k) => {
              return <KravCard key={`${k.navn}_${k.kravNummer}`} krav={k} setEdit={setEdit} setKravId={setKravId} />
            })}
          </CustomizedPanel>
          <CustomizedPanel HeaderActiveBackgroundColor={ettlevColors.green50} title={<PanelHeader title={'Ferdig utfylt'} kravData={utfyltKrav} />}>
            {utfyltKrav.map((k) => {
              return <KravCard key={`${k.navn}_${k.kravNummer}`} krav={k} setEdit={setEdit} setKravId={setKravId} />
            })}
          </CustomizedPanel>
        </CustomizedAccordion>
        {edit && behandling && (
          <Block maxWidth={maxPageWidth}>
            <CustomizedModal isOpen={!!edit} onClose={() => setEdit(undefined)}>
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

const PanelHeader = (props: { title: string; kravData: KravEtterlevelseData[] }) => {
  let antallSuksesskriterier = 0

  props.kravData.forEach((k) => {
    antallSuksesskriterier += k.suksesskriterier.length
  })

  return (
    <Block display="flex" width="100%">
      <HeadingLarge marginTop={theme.sizing.scale100} marginBottom={theme.sizing.scale100} color={ettlevColors.green600}>
        {props.title}
      </HeadingLarge>
      <Block display="flex" justifyContent="flex-end" flex="1" marginRight="26px">
        <Block>
          <Block display="flex" justifyContent="flex-end" alignItems='baseline' flex="1">
            <Label3 marginRight='4px' $style={{ color: ettlevColors.navOransje, fontSize: '20px',lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>{props.kravData.length}</Label3>
            <Paragraph4 $style={{ lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>krav</Paragraph4>
          </Block>
          <Block display="flex" justifyContent="flex-end" flex="1">
            <Paragraph4 $style={{ lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>{antallSuksesskriterier} suksesskriterier</Paragraph4>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}

const toKravId = (it: { kravVersjon: number; kravNummer: number }) => ({ kravNummer: it.kravNummer, kravVersjon: it.kravVersjon })

const EditModal = (props: { etterlevelseId: string; behandlingId: string; kravId?: KravId; close: (e?: Etterlevelse) => void; behandlingNavn: string }) => {
  const [etterlevelse] = useEtterlevelse(props.etterlevelseId, props.behandlingId, props.kravId)
  if (!etterlevelse) return <Spinner size={theme.sizing.scale800} />

  return <Block>{etterlevelse && <KravView behandlingNavn={props.behandlingNavn} kravId={toKravId(etterlevelse)} etterlevelse={etterlevelse} close={props.close} />}</Block>
}

const KravCard = (props: { krav: KravEtterlevelseData; setEdit: Function; setKravId: Function }) => {
  return (
    <Button
      kind={KIND.tertiary}
      $style={{ width: '100%', paddingTop: '0px', paddingBottom: '0px', paddingRight: '0px', paddingLeft: '0px' }}
      onClick={() => {
        if (!props.krav.etterlevelseId) {
          props.setKravId(toKravId(props.krav))
          props.setEdit('ny')
        } else {
          props.setEdit(props.krav.etterlevelseId)
        }
      }}
    >
      <Block width="100%">
        <Card overrides={{ Root: { style: { ...borderWidth('1px') } } }}>
          <Block display="flex" width="100%">
            {/* <img src={circlePencilIcon} alt="pencil icon" /> */}
            <Block marginLeft="24px">
              <Paragraph4 $style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '0px', marginTop: '0px', width: 'fit-content' }}>
                K{props.krav.kravNummer}.{props.krav.kravVersjon}
              </Paragraph4>
              <Label3 $style={{ fontSize: '22px', lineHeight: '28px', alignContent: 'flex-start' }}>{props.krav.navn}</Label3>
            </Block>
          </Block>
        </Card>
      </Block>
    </Button>
  )
}

const KravView = (props: { kravId: KravId; etterlevelse: Etterlevelse; close: Function; behandlingNavn: string }) => {
  const { data } = useQuery<{ kravById: KravQL }, KravId>(kravFullQuery, {
    variables: props.kravId,
    skip: !props.kravId.id && !props.kravId.kravNummer,
  })
  const lover = codelist.getCodes(ListName.LOV)

  const krav = data?.kravById

  const getTema = () => {
    const temaCodes: string[] = []
    let temas = ''

    krav?.regelverk.map((r) => {
      const lov = lover.find((lov) => lov.code === r.lov.code)
      temaCodes.push(lov?.data?.tema || '')
    })

    temaCodes.forEach((temaCode) => {
      const shortName = codelist.getShortname(ListName.TEMA, temaCode)

      temas = temas + shortName + ', '
    })

    temas = temas.substring(0, temas.length - 2)
    temas = temas.replace(/,([^,]*)$/, ' og$1')
    return temas
  }

  return (
    <Block>
      {krav && (
        <EditEtterlevelse
          krav={krav}
          etterlevelse={props.etterlevelse}
          close={(e) => {
            props.close(e)
          }}
        />
      )}
    </Block>
  )
}
