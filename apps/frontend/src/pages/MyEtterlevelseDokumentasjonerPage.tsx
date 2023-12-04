import { HeadingLarge, HeadingXLarge, HeadingXXLarge, LabelLarge, LabelSmall, LabelXSmall, ParagraphSmall } from 'baseui/typography'
import { Block } from 'baseui/block'
import React, { useEffect, useState } from 'react'
import { useMyTeams } from '../api/TeamApi'
import { theme } from '../util'
import Button, { ExternalButton } from '../components/common/Button'
import { emptyPage, EtterlevelseDokumentasjonQL, PageResponse, Team } from '../constants'
import { StatefulInput } from 'baseui/input'
import { gql, useQuery } from '@apollo/client'
import { ettlevColors, maxPageWidth } from '../util/theme'
import CustomizedTabs from '../components/common/CustomizedTabs'
import { PanelLink } from '../components/common/PanelLink'
import { arkPennIcon, bamseIcon, clearSearchIcon, searchIcon } from '../components/Images'
import { env } from '../util/env'
import { InfoBlock2 } from '../components/common/InfoBlock'
import moment from 'moment'
import { useDebouncedState } from '../util/hooks'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { useUser } from '../services/User'
import { useNavigate, useParams } from 'react-router-dom'
import { faExternalLinkAlt, faPlus } from '@fortawesome/free-solid-svg-icons'
import { borderWidth } from '../components/common/Style'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import EditEtterlevelseDokumentasjonModal from '../components/etterlevelseDokumentasjon/edit/EditEtterlevelseDokumentasjonModal'
import BehandlingSok from '../components/etterlevelseDokumentasjon/tabs/BehandlingSok'
import { Loader } from '@navikt/ds-react'

type Section = 'mine' | 'siste' | 'alle' | 'behandlingsok'

interface dokumentasjonCount {
  dokumentasjonCount?: number
}

type CustomTeamObject = dokumentasjonCount & Team

export const tabMarginBottom = '48px'

export const MyEtterlevelseDokumentasjonerPage = () => {
  ampli.logEvent('sidevisning', { side: 'Side for Dokumentasjoner', sidetittel: 'Dokumentere etterlevelse' })

  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Dokumentere etterlevelse</title>
      </Helmet>
      <Block width="100%" backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            {/* <RouteLink hideUnderline>
            <Button startEnhancer={<img alt={'Chevron venstre ikon'} src={navChevronRightIcon} style={{ transform: 'rotate(180deg)' }} />} size="compact" kind="tertiary">
              {' '}
              Tilbake
            </Button>
          </RouteLink> */}
            <CustomizedBreadcrumbs currentPage="Dokumentere etterlevelse" />
            <Block display="flex">
              <Block flex="1">
                <HeadingXXLarge marginTop="0">Dokumentere etterlevelse</HeadingXXLarge>
              </Block>
              <Block display="flex" justifyContent="flex-end">
                <EditEtterlevelseDokumentasjonModal />
              </Block>
            </Block>
          </Block>
        </Block>
      </Block>

      <Block
        display={'flex'}
        justifyContent="center"
        width="100%"
        $style={{
          background: `linear-gradient(top, ${ettlevColors.grey50} 80px, ${ettlevColors.grey25} 0%)`,
        }}
      >
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            <DokumentasjonTabs />
          </Block>
        </Block>
      </Block>
    </Block>
  )
}

const DokumentasjonTabs = () => {
  const user = useUser
  const params = useParams<{ tab?: Section }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Section>(params.tab || 'mine')
  const [doneLoading, setDoneLoading] = useState(false)
  const [variables, setVariables] = useState<Variables>({})
  const { data, loading: etterlevelseDokumentasjonLoading } = useQuery<{ etterlevelseDokumentasjoner: PageResponse<EtterlevelseDokumentasjonQL> }, Variables>(query, {
    variables,
  })

  const [teams, teamsLoading] = useMyTeams()

  const etterlevelseDokumentasjoner = data?.etterlevelseDokumentasjoner || emptyPage
  const loading = teamsLoading || etterlevelseDokumentasjonLoading

  const [sortedTeams, setSortedTeams] = React.useState<CustomTeamObject[]>([])

  const sortTeams = (unSortedTeams: Team[]) => {
    return unSortedTeams
      .map((t) => {
        const teamDokumentasjoner = etterlevelseDokumentasjoner.content.filter((e) => e.teamsData?.find((t2) => t2.id === t.id))

        return {
          ...t,
          etterlevelseDokumentasjonCount: teamDokumentasjoner.length,
        }
      })
      .sort((a, b) => {
        if (a.etterlevelseDokumentasjonCount === 0) {
          return 1
        } else if (b.etterlevelseDokumentasjonCount === 0) {
          return -1
        } else {
          return a.name > b.name ? 1 : -1
        }
      })
  }

  useEffect(() => {
    if (!doneLoading && tab === 'alle') setDoneLoading(true)
    if (!data || etterlevelseDokumentasjonLoading || doneLoading) return
    else if (tab === 'mine' && !etterlevelseDokumentasjoner.totalElements) setTab('siste')
    else if (tab === 'siste' && !etterlevelseDokumentasjoner.totalElements) setTab('alle')
    else setDoneLoading(true)
  }, [etterlevelseDokumentasjoner, etterlevelseDokumentasjonLoading])

  useEffect(() => {
    switch (tab) {
      case 'mine':
        setVariables({ mineEtterlevelseDokumentasjoner: true })
        break
      case 'siste':
        setVariables({ sistRedigert: 20 })
        break
    }
    if (tab !== params.tab) navigate(`/dokumentasjoner/${tab}`, { replace: true })
  }, [tab])

  useEffect(() => {
    // Move away from non-functional pages if user isn't logged in
    if (tab !== 'alle' && user.isLoaded() && !user.isLoggedIn()) setTab('alle')
  }, [user.isLoaded()])

  useEffect(() => {
    setSortedTeams(sortTeams(teams))
  }, [teams])
  return (
    <CustomizedTabs
      fontColor={ettlevColors.green800}
      small
      backgroundColor={ettlevColors.grey25}
      activeKey={tab}
      onChange={(args) => setTab(args.activeKey as Section)}
      tabs={[
        {
          key: 'mine',
          title: 'Mine dokumentasjoner',
          content: <MineEtterlevelseDokumentasjoner teams={sortedTeams} etterlevelseDokumentasjoner={etterlevelseDokumentasjoner.content} loading={loading} />,
        },
        {
          key: 'siste',
          title: 'Mine sist dokumenterte',
          content: <SisteEtterlevelseDokumentasjoner etterlevelseDokumentasjoner={etterlevelseDokumentasjoner.content} loading={loading} />,
        },
        {
          key: 'alle',
          title: 'Alle',
          content: <Alle />,
        },
        {
          key: 'behandlingsok',
          title: 'Søk med behandling',
          content: <BehandlingSok />,
        },
      ]}
    />
  )
}

const MineEtterlevelseDokumentasjoner = ({
  etterlevelseDokumentasjoner,
  teams,
  loading,
}: {
  etterlevelseDokumentasjoner: EtterlevelseDokumentasjonQL[]
  teams: CustomTeamObject[]
  loading: boolean
}) => {
  if (loading)
    return (
      <>
        <EtterlevelseDokumentasjonerPanels etterlevelseDokumentasjoner={[]} loading />
        <Block height={'60px'} />
        <EtterlevelseDokumentasjonerPanels etterlevelseDokumentasjoner={[]} loading />
      </>
    )
  return (
    <Block marginBottom={tabMarginBottom}>
      {!etterlevelseDokumentasjoner.length && !teams.length && <ParagraphSmall>Du er ikke medlem av team med registrerte dokumentasjoner</ParagraphSmall>}

      {teams.map((t) => {
        const teamDokumentasjoner = etterlevelseDokumentasjoner
          .filter((e) => e.teamsData?.find((t2) => t2.id === t.id))
          .filter((value, index, self) => index === self.findIndex((etterlevelseDokumentasjon) => etterlevelseDokumentasjon.id === value.id))
        return (
          <Block key={t.id} marginBottom={theme.sizing.scale900}>
            <Block display={'flex'} justifyContent={'space-between'}>
              <Block>
                <HeadingXLarge marginBottom={theme.sizing.scale100} color={ettlevColors.green600}>
                  {t.name}
                </HeadingXLarge>
                <ParagraphSmall marginTop={0}>
                  Teamet skal etterleve krav i <span style={{ fontWeight: 700 }}>{teamDokumentasjoner.length} dokumentasjoner</span>
                </ParagraphSmall>
              </Block>
              {/* <Block alignSelf={'flex-end'} marginBottom={theme.sizing.scale400}>
                <ExternalButton href={`${env.pollyBaseUrl}process/team/${t.id}`} underlineHover size={'mini'}>
                  Legg til behandling <FontAwesomeIcon icon={faExternalLinkAlt} />
                </ExternalButton>
              </Block> */}
            </Block>

            <EtterlevelseDokumentasjonerPanels etterlevelseDokumentasjoner={teamDokumentasjoner} />
          </Block>
        )
      })}

      <Block maxWidth={'800px'} marginTop={'200px'}>
        <InfoBlock2
          icon={bamseIcon}
          alt={'Bamseikon'}
          title={'Savner du teamet ditt?'}
          beskrivelse={'Legg til teamet i teamkatalogen, så henter vi dokumentasjoner som skal etterleve krav'}
          backgroundColor={ettlevColors.grey25}
        >
          <Block marginTop={theme.sizing.scale600}>
            <ExternalButton href={`${env.teamKatBaseUrl}`}>
              Teamkatalogen <FontAwesomeIcon icon={faExternalLinkAlt} />
            </ExternalButton>
          </Block>
        </InfoBlock2>
      </Block>
    </Block>
  )
}

const SisteEtterlevelseDokumentasjoner = ({ etterlevelseDokumentasjoner, loading }: { etterlevelseDokumentasjoner: EtterlevelseDokumentasjonQL[]; loading: boolean }) => {
  if (!etterlevelseDokumentasjoner.length && !loading) return <ParagraphSmall>Du har ikke dokumentert etterlevelse på krav</ParagraphSmall>
  const sorted = [...etterlevelseDokumentasjoner].sort((a, b) => moment(b.sistEndretEtterlevelse).valueOf() - moment(a.sistEndretEtterlevelse).valueOf())
  return <EtterlevelseDokumentasjonerPanels etterlevelseDokumentasjoner={sorted} loading={loading} />
}

const Alle = () => {
  const [hover, setHover] = useState(false)
  const pageSize = 20
  const [pageNumber, setPage] = useState(0)
  const [sok, setSok] = useDebouncedState('', 300)
  const tooShort = !!sok.length && sok.trim().length < 3
  const {
    data,
    loading: gqlLoading,
    fetchMore,
  } = useQuery<{ etterlevelseDokumentasjoner: PageResponse<EtterlevelseDokumentasjonQL> }, Variables>(query, {
    variables: { pageNumber, pageSize, sok },
    skip: tooShort,
  })
  const etterlevelseDokumentasjoner = data?.etterlevelseDokumentasjoner || emptyPage
  const loading = !data && gqlLoading

  const lastMer = () => {
    fetchMore({
      variables: {
        pageNumber: data!.etterlevelseDokumentasjoner.pageNumber + 1,
        pageSize,
      },
      updateQuery: (p, o) => {
        const oldData = p.etterlevelseDokumentasjoner
        const newData = o.fetchMoreResult!.etterlevelseDokumentasjoner
        return {
          etterlevelseDokumentasjoner: {
            ...oldData,
            pageNumber: newData.pageNumber,
            numberOfElements: oldData.numberOfElements + newData.numberOfElements,
            content: [...oldData.content, ...newData.content],
          },
        }
      },
    }).catch((e) => console.error(e))
  }

  useEffect(() => {
    if (sok && pageNumber !== 0) setPage(0)
  }, [sok])

  const getEtterlevelseDokumentasjonerWithoutDuplicates = () => {
    return etterlevelseDokumentasjoner.content.filter((value, index, self) => index === self.findIndex((etterlevelseDokumentasjon) => etterlevelseDokumentasjon.id === value.id))
  }

  return (
    <Block marginBottom={tabMarginBottom}>
      <LabelLarge marginBottom={theme.sizing.scale200}>Søk i alle dokumentasjoner</LabelLarge>
      <Block
        maxWidth="600px"
        marginBottom={theme.sizing.scale1000}
        display={'flex'}
        flexDirection={'column'}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <StatefulInput
          size="compact"
          placeholder="Søk"
          aria-label={'Søk'}
          onChange={(e) => setSok((e.target as HTMLInputElement).value)}
          clearable
          overrides={{
            Root: { style: { paddingLeft: 0, paddingRight: 0, ...borderWidth('1px') } },
            Input: {
              style: {
                backgroundColor: hover ? ettlevColors.green50 : undefined,
              },
            },
            StartEnhancer: {
              style: {
                backgroundColor: hover ? ettlevColors.green50 : undefined,
              },
            },
            ClearIconContainer: {
              style: {
                backgroundColor: hover ? ettlevColors.green50 : undefined,
              },
            },
            ClearIcon: {
              props: {
                overrides: {
                  Svg: {
                    component: (props: any) => (
                      <Button notBold size="compact" kind="tertiary" onClick={() => props.onClick()}>
                        <img src={clearSearchIcon} alt="tøm" />
                      </Button>
                    ),
                  },
                },
              },
            },
            // EndEnhancer: {style: {marginLeft: theme.sizing.scale400, paddingLeft: 0, paddingRight: 0, backgroundColor: ettlevColors.black}}
          }}
          startEnhancer={<img src={searchIcon} alt="Søk ikon" />}
          // endEnhancer={<img aria-hidden alt={'Søk ikon'} src={sokButtonIcon} />}
        />
        {tooShort && (
          <LabelSmall color={ettlevColors.error400} alignSelf={'flex-end'} marginTop={theme.sizing.scale200}>
            Minimum 3 tegn
          </LabelSmall>
        )}
      </Block>

      {!tooShort && (
        <>
          {loading && (
            <Block>
              <Block marginLeft={theme.sizing.scale400} marginTop={theme.sizing.scale400}>
                <Loader size="large" />
              </Block>
            </Block>
          )}

          {!loading && !!sok && (
            <Block>
              <HeadingLarge color={ettlevColors.green600}>
                {etterlevelseDokumentasjoner.totalElements} treff: “{sok}”
              </HeadingLarge>
              {!etterlevelseDokumentasjoner.totalElements && <LabelXSmall>Ingen treff</LabelXSmall>}
            </Block>
          )}

          <EtterlevelseDokumentasjonerPanels etterlevelseDokumentasjoner={getEtterlevelseDokumentasjonerWithoutDuplicates()} loading={loading} />

          {!loading && etterlevelseDokumentasjoner.totalElements !== 0 && (
            <Block display={'flex'} justifyContent={'space-between'} marginTop={theme.sizing.scale1000}>
              <Block display="flex" alignItems="center">
                <Button
                  onClick={lastMer}
                  icon={faPlus}
                  kind={'secondary'}
                  size="compact"
                  disabled={gqlLoading || etterlevelseDokumentasjoner.numberOfElements >= etterlevelseDokumentasjoner.totalElements}
                >
                  Vis mer
                </Button>

                {gqlLoading && (
                  <Block marginLeft={theme.sizing.scale400}>
                    <Loader size="large" />
                  </Block>
                )}
              </Block>
              <LabelSmall marginRight={theme.sizing.scale400}>
                Viser {etterlevelseDokumentasjoner.numberOfElements}/{etterlevelseDokumentasjoner.totalElements}
              </LabelSmall>
            </Block>
          )}
        </>
      )}
    </Block>
  )
}

export const EtterlevelseDokumentasjonerPanels = ({ etterlevelseDokumentasjoner, loading }: { etterlevelseDokumentasjoner: EtterlevelseDokumentasjonQL[]; loading?: boolean }) => {
  if (loading) return <SkeletonPanel count={5} />
  return (
    <Block marginBottom={tabMarginBottom}>
      {etterlevelseDokumentasjoner.map((ed) => (
        <Block key={ed.id} marginBottom={'8px'}>
          <PanelLink
            useTitleUnderLine
            useDescriptionUnderline
            panelIcon={<img src={arkPennIcon} width="33px" height="33px" aria-hidden alt={'Dokumenter ikon'} />}
            href={`/dokumentasjon/${ed.id}`}
            title={
              <>
                <strong>E{ed.etterlevelseNummer}</strong>
              </>
            }
            beskrivelse={ed.title}
            rightBeskrivelse={!!ed.sistEndretEtterlevelse ? `Sist endret: ${moment(ed.sistEndretEtterlevelse).format('ll')}` : ''}
          />
        </Block>
      ))}
    </Block>
  )
}

export type Variables = {
  pageNumber?: number
  pageSize?: number
  sistRedigert?: number
  mineEtterlevelseDokumentasjoner?: boolean
  sok?: string
  teams?: string[]
  behandlingId?: string
}

export const query = gql`
  query getEtterlevelseDokumentasjoner(
    $pageNumber: NonNegativeInt
    $pageSize: NonNegativeInt
    $mineEtterlevelseDokumentasjoner: Boolean
    $sistRedigert: NonNegativeInt
    $sok: String
    $behandlingId: String
  ) {
    etterlevelseDokumentasjoner: etterlevelseDokumentasjon(
      filter: { mineEtterlevelseDokumentasjoner: $mineEtterlevelseDokumentasjoner, sistRedigert: $sistRedigert, sok: $sok, behandlingId: $behandlingId }
      pageNumber: $pageNumber
      pageSize: $pageSize
    ) {
      pageNumber
      pageSize
      pages
      numberOfElements
      totalElements
      content {
        id
        title
        etterlevelseNummer
        sistEndretEtterlevelse
        teamsData {
          id
          name
        }
      }
    }
  }
`
