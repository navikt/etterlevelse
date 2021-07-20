import { HeadingLarge, HeadingXLarge, HeadingXXLarge, LabelLarge, LabelSmall, LabelXSmall, ParagraphSmall } from 'baseui/typography'
import { Block } from 'baseui/block'
import React, { useEffect, useState } from 'react'
import { getAllTeams, useMyProductAreas, useMyTeams } from '../api/TeamApi'
import RouteLink from '../components/common/RouteLink'
import { theme } from '../util'
import Button, { ExternalButton } from '../components/common/Button'
import { Spinner } from '../components/common/Spinner'
import { BehandlingQL, emptyPage, PageResponse, Team } from '../constants'
import { StatefulInput } from 'baseui/input'
import { gql, useQuery } from '@apollo/client'
import { ettlevColors, maxPageWidth } from '../util/theme'
import CustomizedTabs, { CustomizedTab } from '../components/common/CustomizedTabs'
import { PanelLink } from '../components/common/PanelLink'
import { arkPennIcon, bamseIcon, navChevronRightIcon, paperPenIconBg, searchIcon } from '../components/Images'
import { env } from '../util/env'
import { InfoBlock2 } from '../components/common/InfoBlock'
import moment from 'moment'
import { useDebouncedState } from '../util/hooks'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { user } from '../services/User'
import { useHistory, useParams } from 'react-router-dom'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

type Section = 'mine' | 'siste' | 'alle'

interface BehandlingCount {
  behandlingCount?: number
}

type CustomTeamObject = BehandlingCount & Team

const tabMarginBottom = '100px'

export const MyBehandlingerPage = () => (
  <Block width="100%" paddingBottom={'200px'}>
    <Block width="100%" backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
      <Block maxWidth={maxPageWidth} width="100%">
        <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
          <RouteLink hideUnderline>
            <Button startEnhancer={<img alt={'Chevron venstre ikon'} src={navChevronRightIcon} style={{ transform: 'rotate(180deg)' }} />} size="compact" kind="tertiary">
              {' '}
              Tilbake
            </Button>
          </RouteLink>

          <HeadingXXLarge marginTop={theme.sizing.scale600}>Dokumentere etterlevelse</HeadingXXLarge>
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
          <BehandlingTabs />
        </Block>
      </Block>
    </Block>
  </Block>
)

const BehandlingTabs = () => {
  const params = useParams<{ tab?: Section }>()
  const history = useHistory()
  const [tab, setTab] = useState<Section>(params.tab || 'mine')
  const [doneLoading, setDoneLoading] = useState(false)
  const [variables, setVariables] = useState<Variables>({})
  const { data, loading: behandlingerLoading } = useQuery<{ behandlinger: PageResponse<BehandlingQL> }, Variables>(query, {
    variables,
    skip: !variables.mineBehandlinger && !variables.sistRedigert,
  })
  const [teams, teamsLoading] = useMyTeams()
  const [productAreas, productAreasLoading] = useMyProductAreas()
  const behandlinger = data?.behandlinger || emptyPage
  const loading = teamsLoading || productAreasLoading || behandlingerLoading
  const [sortedTeams, setSortedTeams] = useState<CustomTeamObject[]>()

  const sortTeams = (unSortedTeams: Team[]) => {
    return unSortedTeams
      .map((t) => {
        const teamBehandlinger = behandlinger.content.filter((b) => b.teamsData.find((t2) => t2.id === t.id))

        return {
          ...t,
          behandlingCount: teamBehandlinger.length,
        }
      })
      .sort((a, b) => {
        if (a.behandlingCount === 0) {
          return 1
        } else if (b.behandlingCount === 0) {
          return -1
        } else {
          return a.name > b.name ? 1 : -1
        }
      })
  }

  const getNewTeams = () => {
    getAllTeams().then((response) => {
      const teamList = productAreas.map((pa) => response.filter((t) => pa.id === t.productAreaId)).flat()
      const uniqueValuesSet = new Set()

      const uniqueFilteredTeamList = teamList.filter((t) => {
        const isPresentInSet = uniqueValuesSet.has(t.name)
        uniqueValuesSet.add(t.name)
        return !isPresentInSet
      })
      setSortedTeams(sortTeams(uniqueFilteredTeamList))
    })
  }

  useEffect(() => {
    if (!doneLoading && tab === 'alle') setDoneLoading(true)
    if (!data || behandlingerLoading || doneLoading) return
    else if (tab === 'mine' && !behandlinger.totalElements) setTab('siste')
    else if (tab === 'siste' && !behandlinger.totalElements) setTab('alle')
    else setDoneLoading(true)
  }, [behandlinger, behandlingerLoading])

  useEffect(() => {
    switch (tab) {
      case 'mine':
        setVariables({ mineBehandlinger: true })
        break
      case 'siste':
        setVariables({ sistRedigert: 20 })
        break
    }
    if (tab !== params.tab) history.replace(`/behandlinger/${tab}`)
  }, [tab])

  useEffect(() => {
    // Move away from non-functional pages if user isn't logged in
    if (tab !== 'alle' && user.isLoaded() && !user.isLoggedIn()) setTab('alle')
  }, [user.isLoaded()])

  useEffect(() => {
    if (!teams.length && !teamsLoading) {
      getNewTeams()
    } else {
      setSortedTeams(sortTeams(teams))
    }
  }, [teams])

  return (
    <CustomizedTabs fontColor={ettlevColors.green800} small backgroundColor={ettlevColors.grey25} activeKey={tab} onChange={(args) => setTab(args.activeKey as Section)}>
      <CustomizedTab key={'mine'} title={'Mine behandlinger'}>
        {sortedTeams && <MineBehandlinger teams={sortedTeams} behandlinger={behandlinger.content} loading={loading} />}
      </CustomizedTab>
      <CustomizedTab key={'siste'} title={'Mine sist dokumenterte'}>
        <SisteBehandlinger behandlinger={behandlinger.content} loading={loading} />
      </CustomizedTab>

      <CustomizedTab key={'alle'} title={'Alle'}>
        <Alle />
      </CustomizedTab>
    </CustomizedTabs>
  )
}

const MineBehandlinger = ({ behandlinger, teams, loading }: { behandlinger: BehandlingQL[]; teams: CustomTeamObject[]; loading: boolean }) => {
  if (loading)
    return (
      <>
        <BehandlingerPanels behandlinger={[]} loading />
        <Block height={'60px'} />
        <BehandlingerPanels behandlinger={[]} loading />
      </>
    )
  return (
    <Block marginBottom={tabMarginBottom}>
      {!behandlinger.length && <ParagraphSmall>Du er ikke medlem av team med registrerte behandlinger </ParagraphSmall>}

      {teams.map((t) => {
        const teamBehandlinger = behandlinger.filter((b) => b.teamsData.find((t2) => t2.id === t.id))
        return (
          <Block key={t.id} marginBottom={theme.sizing.scale900}>
            <Block display={'flex'} justifyContent={'space-between'}>
              <Block>
                <HeadingXLarge marginBottom={theme.sizing.scale100} color={ettlevColors.green600}>
                  {t.name}
                </HeadingXLarge>
                <ParagraphSmall marginTop={0}>
                  Teamet skal etterleve krav i <span style={{ fontWeight: 700 }}>{teamBehandlinger.length} behandlinger</span>
                </ParagraphSmall>
              </Block>
              <Block alignSelf={'flex-end'} marginBottom={theme.sizing.scale400}>
                <ExternalButton href={`${env.pollyBaseUrl}process/team/${t.id}`} underlineHover size={'mini'}>
                  Legg til behandling
                </ExternalButton>
              </Block>
            </Block>

            <BehandlingerPanels behandlinger={teamBehandlinger} />
          </Block>
        )
      })}

      <Block maxWidth={'800px'} marginTop={'200px'}>
        <InfoBlock2
          icon={bamseIcon}
          alt={'Bamseikon'}
          title={'Savner du teamet ditt?'}
          beskrivelse={'Legg til teamet i teamkatalogen, så henter vi behandlinger som skal etterleve krav'}
          backgroundColor={ettlevColors.grey25}
        >
          <Block marginTop={theme.sizing.scale600}>
            <ExternalButton href={`${env.teamKatBaseUrl}`}>Teamkatalogen</ExternalButton>
          </Block>
        </InfoBlock2>
      </Block>
    </Block>
  )
}

const SisteBehandlinger = ({ behandlinger, loading }: { behandlinger: BehandlingQL[]; loading: boolean }) => {
  if (!behandlinger.length && !loading) return <ParagraphSmall>Du har ikke dokumentert etterlevelse på krav</ParagraphSmall>
  const sorted = [...behandlinger].sort((a, b) => moment(b.sistEndretEtterlevelse).valueOf() - moment(a.sistEndretEtterlevelse).valueOf())
  return <BehandlingerPanels behandlinger={sorted} loading={loading} />
}

const Alle = () => {
  const pageSize = 20
  const [pageNumber, setPage] = useState(0)
  const [sok, setSok] = useDebouncedState('', 300)
  const tooShort = !!sok.length && sok.trim().length < 3
  const {
    data,
    loading: gqlLoading,
    fetchMore,
  } = useQuery<{ behandlinger: PageResponse<BehandlingQL> }, Variables>(query, {
    variables: { pageNumber, pageSize, sok },
    skip: tooShort,
  })
  const behandlinger = data?.behandlinger || emptyPage
  const loading = !data && gqlLoading

  const lastMer = () => {
    fetchMore({
      variables: {
        pageNumber: data!.behandlinger.pageNumber + 1,
        pageSize,
      },
      updateQuery: (p, o) => {
        const oldData = p.behandlinger
        const newData = o.fetchMoreResult!.behandlinger
        return {
          behandlinger: {
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
    if (sok && pageNumber != 0) setPage(0)
  }, [sok])

  return (
    <Block marginBottom={tabMarginBottom}>
      <LabelLarge marginBottom={theme.sizing.scale200}>Søk i alle behandlinger</LabelLarge>

      <Block maxWidth="600px" marginBottom={theme.sizing.scale1000} display={'flex'} flexDirection={'column'}>
        <StatefulInput
          size="compact"
          placeholder="Søk"
          aria-label={'Søk'}
          onChange={(e) => setSok((e.target as HTMLInputElement).value)}
          clearable
          overrides={{
            Root: { style: { paddingLeft: 0, paddingRight: 0 } },
            // EndEnhancer: {style: {marginLeft: theme.sizing.scale400, paddingLeft: 0, paddingRight: 0, backgroundColor: ettlevColors.black}}
          }}
          startEnhancer={<img src={searchIcon} alt="Søk ikon" />}
          // endEnhancer={<img aria-hidden alt={'Søk ikon'} src={sokButtonIcon}/>}
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
                <Spinner size={theme.sizing.scale1000} />
              </Block>
            </Block>
          )}

          {!loading && !!sok && (
            <Block>
              <HeadingLarge color={ettlevColors.green600}>
                {behandlinger.totalElements} treff: “{sok}”
              </HeadingLarge>
              {!behandlinger.totalElements && <LabelXSmall>Ingen treff</LabelXSmall>}
            </Block>
          )}

          <BehandlingerPanels behandlinger={behandlinger.content} loading={loading} />

          {!loading && behandlinger.totalElements !== 0 && (
            <Block display={'flex'} justifyContent={'space-between'} marginTop={theme.sizing.scale1000}>
              <Block display="flex" alignItems="center">
                <Button onClick={lastMer} icon={faPlus} kind={'secondary'} size="compact" disabled={gqlLoading || behandlinger.numberOfElements >= behandlinger.totalElements}>
                  Last mer
                </Button>

                {gqlLoading && (
                  <Block marginLeft={theme.sizing.scale400}>
                    <Spinner size={theme.sizing.scale800} />
                  </Block>
                )}
              </Block>
              <LabelSmall marginRight={theme.sizing.scale400}>
                Viser {behandlinger.numberOfElements}/{behandlinger.totalElements}
              </LabelSmall>
            </Block>
          )}
        </>
      )}
    </Block>
  )
}

const BehandlingerPanels = ({ behandlinger, loading }: { behandlinger: BehandlingQL[]; loading?: boolean }) => {
  if (loading) return <SkeletonPanel count={5} />
  return (
    <Block marginBottom={tabMarginBottom}>
      {behandlinger.map((b) => (
        <Block key={b.id} marginBottom={'8px'}>
          <PanelLink
            panelIcon={<img src={arkPennIcon} width="33px" height="33px" aria-hidden alt={'Dokumenter behandling ikon'} />}
            href={`/behandling/${b.id}`}
            title={`${b.nummer}: ${b.navn}`}
            beskrivelse={b.overordnetFormaal.shortName}
            rightBeskrivelse={!!b.sistEndretEtterlevelse ? `Sist endret: ${moment(b.sistEndretEtterlevelse).format('ll')}` : ''}
          />
        </Block>
      ))}
    </Block>
  )
}

type Variables = { pageNumber?: number; pageSize?: number; sistRedigert?: number; mineBehandlinger?: boolean; sok?: string; teams?: string[] }

const query = gql`
  query getMineBehandlinger($pageNumber: NonNegativeInt, $pageSize: NonNegativeInt, $mineBehandlinger: Boolean, $sistRedigert: NonNegativeInt, $sok: String) {
    behandlinger: behandling(filter: { mineBehandlinger: $mineBehandlinger, sistRedigert: $sistRedigert, sok: $sok }, pageNumber: $pageNumber, pageSize: $pageSize) {
      pageNumber
      pageSize
      pages
      numberOfElements
      totalElements
      content {
        id
        navn
        nummer
        sistEndretEtterlevelse
        overordnetFormaal {
          shortName
        }
        teamsData {
          id
          name
        }
      }
    }
  }
`
