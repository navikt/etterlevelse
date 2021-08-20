import React, {useRef, useState} from 'react'
import {Block, Display, Responsive} from 'baseui/block'
import {useParams} from 'react-router-dom'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'
import {useBehandling} from '../api/BehandlingApi'
import {H1, H2, HeadingLarge, Label3, Paragraph2, Paragraph4} from 'baseui/typography'
import {FormikProps} from 'formik'
import {ettlevColors, theme} from '../util/theme'
import {Layout2} from '../components/scaffold/Page'
import {Teams} from '../components/common/TeamName'
import {arkPennIcon, ellipse80} from '../components/Images'
import {Behandling, BehandlingEtterlevData, EtterlevelseStatus, PageResponse} from '../constants'
import {useQuery} from '@apollo/client'
import {BehandlingStats, statsQuery} from '../components/behandling/ViewBehandling'
import {Code, codelist, ListName, TemaCode} from '../services/Codelist'
import {PanelLinkCard, PanelLinkCardOverrides} from '../components/common/PanelLink'
import {cardWidth} from './TemaPage'
import {ProgressBar, SIZE} from 'baseui/progress-bar'
import {Button} from 'baseui/button'
import EditBehandlingModal from '../components/behandling/EditBehandlingModal'
import {Tag} from 'baseui/tag'
import {borderColor} from '../components/common/Style'
import {breadcrumbPaths} from '../components/common/CustomizedBreadcrumbs'

const responsiveDisplay:Responsive<Display> = ['block','block','block','block','flex','flex']

export const BehandlingPage = () => {
  const params = useParams<{ id?: string }>()
  const options = codelist.getParsedOptions(ListName.RELEVANS)
  const [behandling, setBehandling] = useBehandling(params.id)
  const formRef = useRef<FormikProps<any>>()
  const { data, refetch } = useQuery<{ behandling: PageResponse<{ stats: BehandlingStats }> }>(statsQuery, {
    variables: { behandlingId: behandling?.id },
    skip: !behandling?.id,
  })
  const [edit, setEdit] = useState(false)

  const [stats, setStats] = useState<any[]>([])

  const filterData = (
    unfilteredData:
      | {
          behandling: PageResponse<{
            stats: BehandlingStats
          }>
        }
      | undefined,
  ) => {
    const StatusListe: any[] = []
    unfilteredData?.behandling.content.forEach(({ stats }) => {
      stats.fyltKrav.forEach((k) => {
        if (k.regelverk.length) {
          StatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id) })
        }
      })
      stats.ikkeFyltKrav.forEach((k) => {
        if (k.regelverk.length) {
          StatusListe.push({ ...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id) })
        }
      })
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

  React.useEffect(() => {
    setTimeout(() => refetch(), 200)
  }, [behandling])

  const temaListe = codelist.getCodes(ListName.TEMA).sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))
  let antallFylttKrav = 0
  stats.forEach((k) => {
    if (k.etterlevelser.length && k.etterlevelser[0].status === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
      antallFylttKrav += 1
    }
  })
  const getPercentageUtfylt = stats && stats.length && (antallFylttKrav / stats.length) * 100

  const getMainHeader = (behandling: Behandling) => (
    <Block display="flex" justifyContent="space-between" marginBottom="70px">
      <Block>
        <Label3 color={ettlevColors.green600}>DOKUMENTERE ETTERLEVELSE</Label3>
        <H1 marginTop="0" color={ettlevColors.green800}>
          {behandling.navn}
        </H1>
        <Paragraph2>{behandling.overordnetFormaal.shortName}</Paragraph2>
        <Teams teams={behandling.teams} link list />
      </Block>
    </Block>
  )

  const getSecondaryHeader = (behandling: Behandling) => (
    <Block width="100%" display={responsiveDisplay} alignItems="center" justifyContent="space-between">

      <Block display="flex" alignItems="center">
        <Block marginRight="30px">
          <img src={arkPennIcon} alt="penn ikon" height="50px" width="40px" />
        </Block>
        <Block>
          <Paragraph2 marginBottom="0px" marginTop="0px">
            Steg 1 av 3
          </Paragraph2>
          <H2 marginTop="0px" marginBottom="0px">
            Tema for dokumentasjon
          </H2>
        </Block>
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

  const getRelevans = (irrelevans?: Code[]) => {
    if (irrelevans) {
      const relevans = options
        .map((r, i) => {
          return i
        })
        .filter((n) => !irrelevans.map((ir: Code) => options.findIndex((o) => o.id === ir.code)).includes(n))
      return (
        <Block display={responsiveDisplay}>
          {relevans.map((optionIndex, index) => (
            <Block key={options[optionIndex].id} display="flex">
              <Block marginRight="18px">{options[optionIndex].label}</Block>
              <Block marginRight="18px" display={["none","none","none","none","block","block"]}>{index < relevans.length - 1 ? <img alt="dot" src={ellipse80}/> : undefined}</Block>
            </Block>
          ))}
        </Block>
      )
    }
    return (
      <Block display={responsiveDisplay}>
        {options.map((o, index) => (
          <Block key={o.id} display="flex">
            <Block marginRight="18px">{o.label}</Block>
            <Block marginRight="18px" display={["none","none","none","none","block","block"]}>{index < options.length - 1 ? <img alt="dot" src={ellipse80} /> : undefined}</Block>
          </Block>
        ))}
      </Block>
    )
  }

  if (!behandling) return <LoadingSkeleton header="Behandling" />

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/behandlinger',
    },
  ]

  return (
    <Block width="100%">
      <Layout2
        headerBackgroundColor={ettlevColors.grey50}
        mainHeader={getMainHeader(behandling)}
        secondaryHeaderBackgroundColor={ettlevColors.white}
        secondaryHeader={getSecondaryHeader(behandling)}
        childrenBackgroundColor={ettlevColors.grey25}
        currentPage={behandling.navn}
        breadcrumbPaths={breadcrumbPaths}
      >
        <Block backgroundColor={ettlevColors.grey50} marginTop={theme.sizing.scale800}>
          <Block padding="22px">
            <Block  display={responsiveDisplay}>
              <Block>
                <HeadingLarge>Egenskaper til behandlingen</HeadingLarge>
                <Paragraph4
                  $style={{
                    lineHeight: '24px',
                  }}
                >
                  {!behandling.irrelevansFor.length ? getRelevans() : getRelevans(behandling.irrelevansFor)}
                </Paragraph4>
              </Block>

              <Block flex="1" display="flex" alignItems="flex-end" flexDirection="column">
                <Block>
                  <Block flex="1" display="flex" justifyContent="flex-end">
                    <Paragraph4
                      $style={{
                        lineHeight: '24px',
                      }}
                    >
                      Antall egenskaper: {options.length - behandling.irrelevansFor.length}
                    </Paragraph4>
                  </Block>

                  <Button onClick={() => setEdit(!edit)}>Tilpass egenskapene</Button>
                </Block>
              </Block>

            </Block>
          </Block>
        </Block>
        <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale550}>
          {temaListe.map((tema) => (
            <TemaCardBehandling tema={tema} stats={stats} behandling={behandling} key={`${tema.shortName}_panel`} />
          ))}
        </Block>
      </Layout2>

      {edit && (
        <EditBehandlingModal
          showModal={edit}
          behandling={behandling}
          formRef={formRef}
          setBehandling={setBehandling}
          close={(e?: BehandlingEtterlevData) => {
            setEdit(false)
            e && setBehandling({ ...behandling, ...e })
          }}
        />
      )}
    </Block>
  )
}

const HeaderContent = (props: { kravLength: number }) => (
  <Block marginBottom="33px">
    <Tag
      closeable={false}
      overrides={{
        Root: {
          style: {
            backgroundColor: ettlevColors.green50,
            ...borderColor(ettlevColors.green50),
          },
        },
      }}
    >
      <Block display="flex" alignItems="baseline">
        <Label3 color={ettlevColors.navOransje} $style={{ fontSize: '20px', lineHeight: '18px' }} marginRight="4px">
          {props.kravLength}
        </Label3>
        <Paragraph4 $style={{ lineHeight: '18px', marginTop: '0px', marginBottom: '0px' }}>krav</Paragraph4>
      </Block>
    </Tag>
  </Block>
)

const TemaCardBehandling = ({ tema, stats, behandling }: { tema: TemaCode; stats: any[]; behandling: Behandling }) => {
  const lover = codelist.getCodesForTema(tema.code).map((c) => c.code)

  const krav = stats.filter((k) => k.regelverk.map((r: any) => r.lov.code).some((r: any) => lover.includes(r)))
  let utfylt = 0
  let underArbeid = 0
  let tilUtfylling = 0

  krav.forEach((k) => {
    if (k.etterlevelser.length && k.etterlevelser[0].status === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
      utfylt += 1
    } else if (
      k.etterlevelser.length &&
      (k.etterlevelser[0].status === EtterlevelseStatus.OPPFYLLES_SENERE ||
        k.etterlevelser[0].status === EtterlevelseStatus.UNDER_REDIGERING ||
        k.etterlevelser[0].status === EtterlevelseStatus.FERDIG)
    ) {
      underArbeid += 1
    } else {
      tilUtfylling += 1
    }
  })

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
          display: !krav.length ? 'none' : 'block',
        },
      },
    },
  }

  return (
    <PanelLinkCard
      width={cardWidth}
      overrides={overrides}
      verticalMargin={theme.sizing.scale400}
      href={`/behandling/${behandling.id}/${tema.code}`}
      tittel={tema.shortName}
      headerContent={<HeaderContent kravLength={krav.length} />}
      flexContent
      hideArrow
    >
      <Block marginTop={theme.sizing.scale650} width={"100%"}>
        <Block display="flex" flex={1}>
          <Paragraph4 marginTop="0px" marginBottom="2px">
            Ferdig utfylt:
          </Paragraph4>
          <Block display="flex" flex={1} justifyContent="flex-end">
            <Paragraph4 marginTop="0px" marginBottom="2px">
              {utfylt} av {krav.length} krav
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
