import React, {ReactNode, useRef, useState} from 'react'
import {Block, Display, Responsive} from 'baseui/block'
import {useParams} from 'react-router-dom'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'
import {useBehandling} from '../api/BehandlingApi'
import {H1, H2, H3, Label3, Paragraph2, Paragraph4} from 'baseui/typography'
import {FormikProps} from 'formik'
import {ettlevColors, theme} from '../util/theme'
import {Layout2} from '../components/scaffold/Page'
import {Teams} from '../components/common/TeamName'
import {arkPennIcon, editIcon, ellipse80, externalLinkIcon, warningAlert} from '../components/Images'
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
import {borderColor, marginZero} from '../components/common/Style'
import {breadcrumbPaths} from '../components/common/CustomizedBreadcrumbs'
import {Helmet} from 'react-helmet'
import {ExternalButton} from '../components/common/Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {env} from '../util/env'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'

const responsiveDisplay: Responsive<Display> = ['block', 'block', 'block', 'block', 'flex', 'flex']

export const getMainHeader = (behandling: Behandling, helmet?: ReactNode) => (
  <Block display={responsiveDisplay} justifyContent="space-between" marginBottom="32px" marginTop="38px">
    {helmet ? (
      helmet
    ) : (
      <Helmet>
        <meta charSet="utf-8"/>
        <title>
          B{behandling.nummer.toString()} {behandling.navn.toString()}
        </title>
      </Helmet>
    )}
    <Block width="100%">
      <Label3 color={ettlevColors.green600}>
        B{behandling.nummer} {behandling.overordnetFormaal.shortName}
      </Label3>
      <H1 marginTop="0" color={ettlevColors.green800}>
        {behandling.navn}
      </H1>
      <Block display="flex" alignItems="center" width="100%" marginTop={'24px'}>
        <Block display={'flex'} width="100%">
          <Label3 $style={{lineHeight: '22px', marginRight: '10px', fontSize:'16px', color: ettlevColors.green600}}>Team: </Label3>
          <Teams teams={behandling.teams} link fontColor={ettlevColors.green800} style={{fontSize: "16px", lineHeight: "22px", fontWeight: 400 }}/>
        </Block>
        <Block display="flex" justifyContent="flex-end" alignContent="center" $style={{whiteSpace: 'nowrap'}}>
          <ExternalButton kind={'secondary'} href={`${env.pollyBaseUrl}process/${behandling.id}`} size="mini">
            <Block display="flex" justifyContent="center">
            Til behandlingskatalogen <img style={{marginLeft: "8px"}} height="18px" width="18px" src={externalLinkIcon}/>
            </Block>
          </ExternalButton>
        </Block>
      </Block>
    </Block>
  </Block>
)

export const BehandlingPage = () => {
  const params = useParams<{ id?: string }>()
  const options = codelist.getParsedOptions(ListName.RELEVANS)
  const [behandling, setBehandling] = useBehandling(params.id)
  const formRef = useRef<FormikProps<any>>()

  const {data: relevanteData, refetch: refetchRelevanteData} = useQuery<{ behandling: PageResponse<{ stats: BehandlingStats }> }>(statsQuery, {
    variables: {behandlingId: behandling?.id},
    skip: !behandling?.id,
  })

  const [edit, setEdit] = useState(false)

  const [relevanteStats, setRelevanteStats] = useState<any[]>([])
  const [irrelevanteStats, setIrrelevanteStats] = useState<any[]>([])

  const filterData = (
    unfilteredData:
      | {
      behandling: PageResponse<{
        stats: BehandlingStats
      }>
    }
      | undefined,
  ) => {
    const relevanteStatusListe: any[] = []
    const irrelevanteStatusListe: any[] = []

    unfilteredData?.behandling.content.forEach(({stats}) => {
      stats.fyltKrav.forEach((k) => {
        if (k.regelverk.length) {
          relevanteStatusListe.push({...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id)})
        }
      })
      stats.ikkeFyltKrav.forEach((k) => {
        if (k.regelverk.length) {
          relevanteStatusListe.push({...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id)})
        }
      })
    })

    unfilteredData?.behandling.content.forEach(({stats}) => {
      stats.irrelevantKrav.forEach((k) => {
        if (k.regelverk.length) {
          irrelevanteStatusListe.push({...k, etterlevelser: k.etterlevelser.filter((e) => e.behandlingId === behandling?.id)})
        }
      })
    })

    relevanteStatusListe.sort((a, b) => {
      if (a.kravNummer === b.kravNummer) {
        return a.kravVersjon - b.kravVersjon
      }
      return a.kravNummer - b.kravNummer
    })

    irrelevanteStatusListe.sort((a, b) => {
      if (a.kravNummer === b.kravNummer) {
        return a.kravVersjon - b.kravVersjon
      }
      return a.kravNummer - b.kravNummer
    })

    for (let index = relevanteStatusListe.length - 1; index > 0; index--) {
      if (relevanteStatusListe[index].kravNummer === relevanteStatusListe[index - 1].kravNummer) {
        relevanteStatusListe.splice(index - 1, 1)
      }
    }

    for (let index = irrelevanteStatusListe.length - 1; index > 0; index--) {
      if (irrelevanteStatusListe[index].kravNummer === irrelevanteStatusListe[index - 1].kravNummer) {
        irrelevanteStatusListe.splice(index - 1, 1)
      }
    }

    return [relevanteStatusListe, irrelevanteStatusListe]
  }

  React.useEffect(() => {
    const [relevanteStatusListe, irrelevanteStatusListe] = filterData(relevanteData)
    setRelevanteStats(relevanteStatusListe)
    setIrrelevanteStats(irrelevanteStatusListe)
  }, [relevanteData])

  React.useEffect(() => {
    setTimeout(() => refetchRelevanteData(), 200)
  }, [behandling])

  const temaListe = codelist.getCodes(ListName.TEMA).sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))
  let antallFylttKrav = 0
  relevanteStats.forEach((k) => {
    if (
      k.etterlevelser.length &&
      (k.etterlevelser[0].status === EtterlevelseStatus.FERDIG_DOKUMENTERT ||
        k.etterlevelser[0].status === EtterlevelseStatus.IKKE_RELEVANT ||
        k.etterlevelser[0].status === EtterlevelseStatus.OPPFYLLES_SENERE)
    ) {
      antallFylttKrav += 1
    }
  })
  const getPercentageUtfylt = relevanteStats && relevanteStats.length && (antallFylttKrav / relevanteStats.length) * 100

  const getRelevansContent = (behandling: Behandling) => {
    const emptyRelevans = behandling.irrelevansFor.length === options.length ? true : false

    return (
      <Block display="flex" width="100%" alignItems="center">
        <Block width="100%" display="flex">
          {emptyRelevans ? (
            <Block display="flex" alignItems="center">
              <img height="16px" width="16px" src={warningAlert} alt=""/>
              <Label3 color={ettlevColors.green600} marginTop="0px" marginBottom="0px" marginRight="5px" marginLeft="5px" $style={{fontSize: '16px'}}>
                Ingen egenskaper er oppgitt
              </Label3>
            </Block>
          ) : (
            <Label3 marginTop="0px" marginBottom="0px" marginRight="5px" $style={{fontSize: '16px'}}>
              Behandlingen skal etterleve krav for:
            </Label3>
          )}

          {!behandling.irrelevansFor.length ? getRelevans() : getRelevans(behandling.irrelevansFor)}
        </Block>
        <Block display="flex" flex="1" justifyContent="flex-end" $style={{whiteSpace: 'nowrap'}}>
          <Button onClick={() => setEdit(!edit)} startEnhancer={<img src={editIcon} alt=""/>}>
            Tilpass egenskaper
          </Button>
        </Block>
      </Block>
    )
  }

  const getSecondaryHeader = (behandling: Behandling) => (
    <Block width="100%" display={responsiveDisplay} alignItems="center" justifyContent="space-between" marginTop={'8px'} marginBottom={'8px'}>
      <Block display="flex" alignItems="center">
        <Block marginRight="12px">
          <img src={arkPennIcon} alt="penn ikon" height="32px" width="32px"/>
        </Block>
        <Block>
          <H2 marginTop="0px" marginBottom="0px">
            Tema for dokumentasjon
          </H2>
        </Block>
      </Block>

      <Block display="flex" alignItems="center">
        <Block display="flex" alignItems="baseline" marginRight="30px">
          <Paragraph2 $style={{fontWeight: 900, fontSize: '32px', marginTop: 0, marginBottom: 0}} color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
            {relevanteStats.length}
          </Paragraph2>
          <Paragraph2>krav</Paragraph2>
        </Block>

        <Block $style={{border: '1px solid ' + ettlevColors.green50, background: '#102723'}} height="40px"/>

        <Block display="flex" alignItems="baseline" marginLeft="30px">
          <Paragraph2 $style={{fontWeight: 900, fontSize: '32px', marginTop: 0, marginBottom: 0}} color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
            {antallFylttKrav}
          </Paragraph2>
          <Paragraph2>ferdig utfylt</Paragraph2>
        </Block>
      </Block>
    </Block>
  )

  const getRelevans = (irrelevans?: Code[]) => {
    if (irrelevans?.length === options.length) {
      return <Paragraph4>For å filtrere bort krav som ikke er relevante, må dere oppgi egenskaper ved behandlingen.</Paragraph4>
    }

    if (irrelevans) {
      const relevans = options
        .map((r, i) => {
          return i
        })
        .filter((n) => !irrelevans.map((ir: Code) => options.findIndex((o) => o.id === ir.code)).includes(n))
      return (
        <Block display={responsiveDisplay} flexWrap>
          {relevans.map((optionIndex, index) => (
            <Block key={options[optionIndex].id} display="flex">
              <Paragraph4 $style={{...marginZero, marginRight: '8px', lineHeight: '24px'}}>{options[optionIndex].label}</Paragraph4>
              <Block marginRight="8px" display={['none', 'none', 'none', 'none', 'block', 'block']}>
                {index < relevans.length - 1 ? <img alt="dot" src={ellipse80}/> : undefined}
              </Block>
            </Block>
          ))}
        </Block>
      )
    }
    return (
      <Block display={responsiveDisplay} flexWrap>
        {options.map((o, index) => (
          <Block key={o.id} display="flex">
            <Paragraph4 $style={{...marginZero, marginRight: '8px', lineHeight: '24px'}}>{o.label}</Paragraph4>
            <Block marginRight="8px" display={['none', 'none', 'none', 'none', 'block', 'block']}>
              {index < options.length - 1 ? <img alt="dot" src={ellipse80}/> : undefined}
            </Block>
          </Block>
        ))}
      </Block>
    )
  }

  if (!behandling) return <LoadingSkeleton header="Behandling"/>

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
        <Block backgroundColor={ettlevColors.grey50} marginTop={theme.sizing.scale800}></Block>
        {getRelevansContent(behandling)}
        <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale550}>
          {temaListe.map((tema) => (
            <TemaCardBehandling tema={tema} stats={relevanteStats} behandling={behandling} key={`${tema.shortName}_panel`}/>
          ))}
        </Block>

        {/*
        DISABLED TEMPORARY
        {irrelevanteStats.length > 0 && (
          <>
            <Block>
              <H3>Tema dere har filtrert bort</H3>
              <Paragraph2 maxWidth={'574px'}>Dere har filtrert bort tema med krav som dere må kjenne til og selv vurdere om dere skal etterleve.</Paragraph2>
            </Block>
            <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale550}>
              {temaListe.map((tema) => (
                <TemaCardBehandling tema={tema} stats={irrelevanteStats} behandling={behandling} key={`${tema.shortName}_panel`} irrelevant={true}/>
              ))}
            </Block>
          </>
        )} */}
      </Layout2>

      {edit && (
        <EditBehandlingModal
          showModal={edit}
          behandling={behandling}
          formRef={formRef}
          setBehandling={setBehandling}
          close={(e?: BehandlingEtterlevData) => {
            setEdit(false)
            e && setBehandling({...behandling, ...e})
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
        <Label3 color={ettlevColors.navOransje} $style={{fontSize: '20px', lineHeight: '18px'}} marginRight="4px">
          {props.kravLength}
        </Label3>
        <Paragraph4 $style={{lineHeight: '18px', marginTop: '0px', marginBottom: '0px'}}>krav</Paragraph4>
      </Block>
    </Tag>
  </Block>
)

const TemaCardBehandling = ({tema, stats, behandling, irrelevant}: { tema: TemaCode; stats: any[]; behandling: Behandling; irrelevant?: boolean }) => {
  const lover = codelist.getCodesForTema(tema.code).map((c) => c.code)

  const krav = stats.filter((k) => k.regelverk.map((r: any) => r.lov.code).some((r: any) => lover.includes(r)))

  let utfylt = 0
  let underArbeid = 0
  let tilUtfylling = 0

  krav.forEach((k) => {
    if (
      k.etterlevelser.length &&
      (k.etterlevelser[0].status === EtterlevelseStatus.FERDIG_DOKUMENTERT ||
        k.etterlevelser[0].status === EtterlevelseStatus.IKKE_RELEVANT ||
        k.etterlevelser[0].status === EtterlevelseStatus.OPPFYLLES_SENERE)
    ) {
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
      href={`/behandling/${behandling.id}/${irrelevant ? 'i' : ''}${tema.code}`}
      tittel={tema.shortName}
      headerContent={<HeaderContent kravLength={krav.length}/>}
      flexContent
      hideArrow
      titleColor={ettlevColors.green600}
    >
      <Block marginTop={theme.sizing.scale650} width={'100%'}>
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
