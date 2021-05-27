import {HeadingLarge, HeadingXLarge, HeadingXXLarge, LabelLarge, LabelSmall, LabelXSmall, ParagraphSmall} from 'baseui/typography'
import {Block} from 'baseui/block'
import React, {useEffect, useState} from 'react'
import {useSearchBehandling} from '../api/BehandlingApi'
import {ListItem, ListItemLabel} from 'baseui/list'
import {useMyTeams} from '../api/TeamApi'
import RouteLink from '../components/common/RouteLink'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTimesCircle} from '@fortawesome/free-solid-svg-icons'
import {theme} from '../util'
import Button, {ExternalButton} from '../components/common/Button'
import {Spinner} from '../components/common/Spinner'
import {Behandling, BehandlingQL, emptyPage, PageResponse, Team} from '../constants'
import {StatefulInput} from 'baseui/input'
import {gql, useQuery} from '@apollo/client'
import {ettlevColors, maxPageWidth, pageWidth} from '../util/theme'
import CustomizedTabs, {CustomizedTab} from '../components/common/CustomizedTabs'
import {PanelLink} from '../components/common/PanelLink'
import {bamseIcon, dokEtterlevelse, navChevronRightIcon} from '../components/Images'
import {env} from '../util/env'
import {InfoBlock2} from '../components/common/InfoBlock'
import moment from 'moment'

type Section = 'mine' | 'siste' | 'alle'

export const MyBehandlingerPage = () => {
  const {data: myBehandlinger, loading: myBehandlingerLoading} = useQuery<{behandlinger: PageResponse<BehandlingQL>}, Variables>(query, {variables: {mineBehandlinger: true}})
  const [teams, teamsLoading] = useMyTeams()

  const [tab, setTab] = useState<Section>('mine')

  useEffect(() => {
    if (myBehandlingerLoading) return
    if (!myBehandlinger?.behandlinger?.content.length) setTab('siste')
  }, [myBehandlinger, myBehandlingerLoading])

  return (
    <Block width='100%' backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
      <Block maxWidth={maxPageWidth} width='100%'>
        {/*todo padding/pagestructure?*/}
        <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>

          <RouteLink href={'/'} hideUnderline>
            <Button startEnhancer={<img alt={'Chevron venstre ikon'} src={navChevronRightIcon} style={{transform: 'rotate(180deg)'}}/>} size='compact' kind='tertiary' hidePadding
                    $style={{':hover': {textDecoration: 'underline 3px'}}}> Tilbake</Button>
          </RouteLink>

          <HeadingXXLarge marginTop={theme.sizing.scale600}>Dokumentere etterlevelse</HeadingXXLarge>

          <CustomizedTabs fontColor={ettlevColors.green800} small backgroundColor={ettlevColors.grey50}
                          activeKey={tab} onChange={args => setTab(args.activeKey as Section)}>

            <CustomizedTab key={'mine'} title={'Mine behandlinger'}>
              <MineBehandlinger teams={teams} behandlinger={myBehandlinger?.behandlinger?.content || []}/>
            </CustomizedTab>

            <CustomizedTab key={'siste'} title={'Mine sist dokumenterte'}>
              <SistRedigerteBehandlinger/>
            </CustomizedTab>

            <CustomizedTab key={'alle'} title={'Alle'}>
              <Alle/>
            </CustomizedTab>

          </CustomizedTabs>


        </Block>

      </Block>
    </Block>
  )
}

const MineBehandlinger = ({behandlinger, teams}: {behandlinger: BehandlingQL[], teams: Team[]}) => {
  return (
    <Block>
      {teams.map(t => {
          const teamBehandlinger = behandlinger.filter(b => b.teamsData.find(t2 => t2.id === t.id))
          return <Block key={t.id} marginBottom={theme.sizing.scale1000}>
            <Block display={'flex'} justifyContent={'space-between'}>

              <Block>
                <HeadingXLarge marginBottom={theme.sizing.scale100} color={ettlevColors.green600}>{t.name}</HeadingXLarge>
                <ParagraphSmall marginTop={0}>Teamet skal etterleve krav i <span style={{fontWeight: 700}}>{teamBehandlinger.length} behandlinger</span></ParagraphSmall>
              </Block>
              <Block alignSelf={'flex-end'} marginBottom={theme.sizing.scale400}>
                <ExternalButton href={`${env.pollyBaseUrl}team/${t.id}`} underlineHover size={'mini'}>
                  Legg til behandling
                </ExternalButton>
              </Block>
            </Block>

            <BehandlingerPanels behandlinger={teamBehandlinger}/>

          </Block>
        }
      )}

      <Block maxWidth={'800px'}>
        <InfoBlock2 icon={bamseIcon} alt={'Bamseikon'} title={'Savner du teamet ditt?'}
                    beskrivelse={'Legg til teamet i teamkatalogen, så henter vi behandlinger som skal etterleve krav'}

        >
          <Block marginTop={theme.sizing.scale600}>
            <ExternalButton href={`${env.teamKatBaseUrl}`}>Teamkatalogen</ExternalButton>
          </Block>
        </InfoBlock2>
      </Block>

      <Block height={'200px'}/>

    </Block>
  )
}

const SistRedigerteBehandlinger = () => {
  const {data, loading} = useQuery<{behandlinger: PageResponse<BehandlingQL>}, Variables>(query, {variables: {sistRedigert: 20}})
  if (loading) return <Spinner size={theme.sizing.scale1000}/>
  return <BehandlingerPanels behandlinger={data!.behandlinger.content}/>
}

const BehandlingerPanels = ({behandlinger}: {behandlinger: BehandlingQL[]}) => (
  <Block>
    {behandlinger.map(b => {
      return (
        <Block key={b.id} marginBottom={'8px'}>
          <PanelLink
            panelIcon={<img src={dokEtterlevelse} aria-hidden alt={'Dokumenter behandling ikon'}/>}
            href={`/behandling/${b.id}`} title={b.navn} beskrivelse={b.overordnetFormaal.shortName}
            rightBeskrivelse={!!b.sistEndretEtterlevelse ? `Sist endret: ${moment(b.sistEndretEtterlevelse).format('ll')}` : ''}

          />
        </Block>
      )
    })}
  </Block>
)

const Alle = () => {
  const pageSize = 20
  const [pageNumber, setPage] = useState(0)
  const {data, loading: loadingAll} = useQuery<{behandlinger: PageResponse<Behandling>}, Variables>(query, {variables: {pageNumber, pageSize}})
  const allBehandlinger = data?.behandlinger || emptyPage
  const [search, setSearch, searchLoading, searchTerm] = useSearchBehandling()

  const prev = () => setPage(Math.max(0, pageNumber - 1))
  const next = () => setPage(Math.min(allBehandlinger?.pages ? allBehandlinger.pages - 1 : 0, pageNumber + 1))

  return (
    <Block maxWidth={pageWidth}>
      <LabelLarge>Søk i alle behandlinger</LabelLarge>

      <Block maxWidth='500px' marginBottom={theme.sizing.scale1000}>
        <StatefulInput size='compact' placeholder='Søk' onChange={e => setSearch((e.target as HTMLInputElement).value)}
                       endEnhancer={
                         <Button onClick={() => setSearch('')} size='compact' kind='tertiary'><FontAwesomeIcon icon={faTimesCircle}/></Button>
                       }/>
        {searchLoading && <Block marginTop={theme.sizing.scale400}><Spinner size={theme.sizing.scale600}/></Block>}
      </Block>
      {!!searchTerm && <Block>
        <HeadingLarge color={ettlevColors.green600}>{search.length} treff: “{searchTerm}”</HeadingLarge>
        {/*<BehandlingerPanels behandlinger={search}/>*/}
        {search.map(b => <BehandlingListItem key={b.id} behandling={b}/>)}
        {!search.length && <LabelXSmall>Ingen treff</LabelXSmall>}
      </Block>}

      {!searchTerm && <Block>
        {allBehandlinger.content.map(b => <BehandlingListItem key={b.id} behandling={b}/>)}
        {loadingAll && !allBehandlinger && <Spinner size={theme.sizing.scale800}/>}

        <Block display='flex' alignItems='center' marginTop={theme.sizing.scale1000}>
          <LabelSmall marginRight={theme.sizing.scale400}>Side {allBehandlinger.pageNumber + 1}/{allBehandlinger.pages}</LabelSmall>
          <Button onClick={prev} size='compact' disabled={allBehandlinger.pageNumber === 0}>Forrige</Button>
          <Button onClick={next} size='compact' disabled={allBehandlinger.pageNumber >= allBehandlinger.pages - 1}>Neste</Button>
        </Block>
      </Block>
      }
    </Block>
  )
}

const BehandlingListItem = (props: {behandling: Behandling}) =>
  <ListItem sublist overrides={{Root: {style: {backgroundColor: 'inherit'}}}}>
    <ListItemLabel sublist>
      <RouteLink href={`/behandling/${props.behandling.id}`}>
        {props.behandling.nummer}: {props.behandling.overordnetFormaal.shortName} - {props.behandling.navn}
      </RouteLink>
    </ListItemLabel>
  </ListItem>

type Variables = {pageNumber?: number, pageSize?: number, sistRedigert?: number, mineBehandlinger?: boolean}

const query = gql`
  query getMineBehandlinger($pageNumber: NonNegativeInt, $pageSize: NonNegativeInt, $mineBehandlinger: Boolean, $sistRedigert: NonNegativeInt) {
    behandlinger: behandling(filter: { mineBehandlinger: $mineBehandlinger, sistRedigert: $sistRedigert },pageNumber: $pageNumber, pageSize: $pageSize) {
      pageNumber
      pageSize
      pages
      content {
        id
        navn
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
