import React, { useRef, useState } from 'react'
import { Block } from 'baseui/block'
import { useParams } from 'react-router-dom'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { useBehandling } from '../api/BehandlingApi'
import { H1, H2, HeadingLarge, Label3, Paragraph2, Paragraph4 } from 'baseui/typography'
import { FormikProps } from 'formik'
import { ettlevColors, theme } from '../util/theme'
import { Layout2 } from '../components/scaffold/Page'
import { Teams } from '../components/common/TeamName'
import { arkPennIcon } from '../components/Images'
import { Behandling, EtterlevelseStatus, PageResponse } from '../constants'
import { useQuery } from '@apollo/client'
import { BehandlingStats, statsQuery } from '../components/behandling/ViewBehandling'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import { PanelLinkCard, PanelLinkCardOverrides } from '../components/common/PanelLink'
import { cardWidth } from './TemaPage'
import { urlForObject } from '../components/common/RouteLink'
import { ProgressBar, SIZE } from 'baseui/progress-bar'
import { ObjectType } from '../components/admin/audit/AuditTypes'

export const BehandlingPage = () => {
  const params = useParams<{ id?: string }>()
  const [behandling, setBehandling] = useBehandling(params.id)
  const formRef = useRef<FormikProps<any>>()
  const { data } = useQuery<{ behandling: PageResponse<{ stats: BehandlingStats }> }>(statsQuery, {
    variables: { behandlingId: behandling?.id },
  })

  const [stats, setStats] = useState<any[]>([])

  const filterData = (
    data:
      | {
        behandling: PageResponse<{
          stats: BehandlingStats
        }>
      }
      | undefined,
  ) => {
    const StatusListe: any[] = []
    data?.behandling.content[0].stats.fyltKrav.forEach((k) => {
      if (k.regelverk.length) {
        StatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id) })
      }
    })
    data?.behandling.content[0].stats.ikkeFyltKrav.forEach((k) => {
      if (k.regelverk.length) {
        StatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id) })
      }
    })
    StatusListe.sort((a, b) => {
      if (a.kravNummer === b.kravNummer) {
        return a.kravVersjon - b.kravVersjon
      }

      return a.kravNummer - b.kravNummer
    })

    for (let index = StatusListe.length - 1; index > 0; index--) {
      if (StatusListe[index].kravNummer === StatusListe[index - 1].kravNummer) {
        StatusListe.splice(index - 1, 1)
      }
    }

    return StatusListe
  }

  React.useEffect(() => {
    setStats(filterData(data))
  }, [data])

  const temaListe = codelist.getCodes(ListName.TEMA).sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))
  let antallFylttKrav = 0
  stats.forEach((k) => {
    if (k.etterlevelser.length && k.etterlevelser[0].status === EtterlevelseStatus.FERDIG) {
      antallFylttKrav += 1
    }
  })
  const getPercentageUtfylt = stats && stats.length && (antallFylttKrav / stats.length) * 100

  const getMainHeader = (behandling: Behandling) => (
    <Block display="flex" justifyContent="space-between" marginBottom="70px">
      <Block marginTop={theme.sizing.scale1200}>
        <Label3 color={ettlevColors.green600}>DOKUMENTERE ETTERLEVELSE</Label3>
        <H1 marginTop="0" color={ettlevColors.green800}>
          {behandling.navn}
        </H1>
        <Paragraph2>{behandling.overordnetFormaal.shortName}</Paragraph2>
        <Teams teams={behandling.teams} link list />
      </Block>

      <Block width="400px" height="260px" backgroundColor={ettlevColors.white} marginTop={theme.sizing.scale400}>
        <Block padding="5px">
          <HeadingLarge>Hva er egenskapene til behandlingen?</HeadingLarge>
          <Block $style={{ fontWeight: 400, fontSize: '18px', fontFamily: 'Source Sans Pro' }}>
            Hvis du tilpasser egenskapene skjuler vi kravene som ikke er relevante for din løsning.
          </Block>
        </Block>
      </Block>
    </Block>
  )

  const getSecondaryHeader = (behandling: Behandling) => (
    <Block width="100%" height="100px" maxHeight="100px" display="flex" alignItems="center" justifyContent="space-between">
      <Block display="flex" alignItems="center">
        <Block marginRight="30px">
          <img src={arkPennIcon} alt="test" height="50px" width="40px" />
        </Block>
        <H2>Tema for dokumentasjon</H2>
      </Block>

      <Block display="flex" alignItems="center">
        <Block display="flex" alignItems="baseline" marginRight="30px">
          <H1 color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
            {stats.length}
          </H1>
          <Paragraph2>krav</Paragraph2>
        </Block>

        <Block $style={{ border: '1px solid ' + ettlevColors.green50, background: '#102723' }} height="40px" />

        <Block display="flex" alignItems="baseline" marginLeft="30px">
          <H1 color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
            {antallFylttKrav}
          </H1>
          <Paragraph2>ferdig utfylt</Paragraph2>
        </Block>
      </Block>
    </Block>
  )

  if (!behandling) return <LoadingSkeleton header="Behandling" />

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey50}
      mainHeader={getMainHeader(behandling)}
      secondaryHeaderBackgroundColor={ettlevColors.white}
      secondaryHeader={getSecondaryHeader(behandling)}
      childrenBackgroundColor={ettlevColors.grey25}
      backBtnUrl={'/behandlinger'}
    >
      <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale1200}>
        {temaListe.map((tema) => (
          <TemaCardBehandling tema={tema} stats={stats} behandling={behandling} />
        ))}
      </Block>
    </Layout2>
  )
}

const HeaderContent = (props: { tilUtfylling: number; underArbeid: number }) => (
  <Block marginBottom="33px">
    <Paragraph4 marginTop="0px" marginBottom="0px">
      Til utfylling: {props.tilUtfylling} krav
    </Paragraph4>
    <Paragraph4 marginTop="0px" marginBottom="0px">
      Under arbeid: {props.underArbeid} krav
    </Paragraph4>
  </Block>
)

const TemaCardBehandling = ({ tema, stats, behandling }: { tema: TemaCode; stats: any[]; behandling: Behandling }) => {
  const lover = codelist.getCodesForTema(tema.code).map((c) => c.code)

  const krav = stats.filter((k) => k.regelverk.map((r: any) => r.lov.code).some((r: any) => lover.includes(r)))

  let utfylt = 0
  let underArbeid = 0
  let tilUtfylling = 0

  krav.forEach((k) => {
    if (k.etterlevelser.length && k.etterlevelser[0].status === EtterlevelseStatus.FERDIG) {
      utfylt += 1
    } else if (k.etterlevelser.length && (k.etterlevelser[0].status === EtterlevelseStatus.OPPFYLLES_SENERE || k.etterlevelser[0].status === EtterlevelseStatus.UNDER_REDIGERING)) {
      underArbeid += 1
    } else {
      tilUtfylling += 1
    }
  })

  if (tema.shortName === 'Personvern') {
    console.log('KRAV!!!', tema.shortName, krav)
  }
  // const variables = filterForBehandling(behandling, lover)
  // const { data: rawData, loading } = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
  //   variables,
  //   skip: !lover.length
  // })
  // const krav = rawData?.krav.content.filter(k => !relevans.length || k.relevansFor.map(r => r.code).some(r => relevans.includes(r))) || []

  // if (krav.length) {
  //   for (let index = krav.length - 1; index > 0; index--) {
  //     if (krav[index].kravNummer === krav[index - 1].kravNummer) {
  //       krav.splice(index - 1, 1)
  //     }
  //   }
  //   console.log(krav, tema.shortName)
  // }

  const overrides: PanelLinkCardOverrides = {
    Header: {
      Block: {
        style: {
          backgroundColor: ettlevColors.green100,
          height: '180px',
          paddingBottom: theme.sizing.scale600,
        },
      },
    },
    Content: {
      Block: {
        style: {
          maskImage: `linear-gradient(${ettlevColors.black} 90%, transparent)`,
          overflow: 'hidden',
        },
      },
    },
    Root: {
      Block: {
        style: {
          display: !krav.length ? 'none' : 'block'
        }
      }
    }
  }

  return (
      <PanelLinkCard
        width={cardWidth}
        overrides={overrides}
        verticalMargin={theme.sizing.scale400}
        href={urlForObject(ObjectType.BehandlingDoc, behandling.id, undefined, tema.code)}
        tittel={tema.shortName}
        headerContent={<HeaderContent tilUtfylling={tilUtfylling} underArbeid={underArbeid} />}
        flexContent
      >
        <Block marginTop={theme.sizing.scale650}>
          <Block display="flex" flex={1}>
            <Paragraph4 marginTop="0px" marginBottom="2px">
              Ferdig utfylt:
            </Paragraph4>
            <Block display='flex' flex={1} justifyContent='flex-end'>
              <Paragraph4 marginTop="0px" marginBottom="2px">
                {utfylt} krav
              </Paragraph4>
            </Block>
          </Block>
          <Block>
            <ProgressBar
              value={utfylt}
              successValue={krav.length}
              size={SIZE.medium}
              overrides={{
                BarProgress: {
                  style: {
                    backgroundColor: ettlevColors.green800,
                  },
                },
                BarContainer: {
                  style: {
                    marginLeft: '0px',
                    marginRight: '0px',
                  },
                },
              }}
            />
          </Block>
        </Block>
      </PanelLinkCard>
  )
}
