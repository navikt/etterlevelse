import {HeadingLarge, HeadingMedium, HeadingXXLarge, LabelSmall, LabelXSmall, ParagraphSmall} from 'baseui/typography'
import {Block} from 'baseui/block'
import React, {useEffect, useState} from 'react'
import {useMyBehandlinger, useSearchBehandling} from '../api/BehandlingApi'
import {ListItem, ListItemLabel} from 'baseui/list'
import {useMyTeams} from '../api/TeamApi'
import RouteLink, {ExternalLink} from '../components/common/RouteLink'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt, faTimesCircle} from '@fortawesome/free-solid-svg-icons'
import {theme} from '../util'
import Button from '../components/common/Button'
import {Spinner} from '../components/common/Spinner'
import {Behandling, emptyPage, PageResponse, Team} from '../constants'
import {StatefulInput} from 'baseui/input'
import {gql, useQuery} from '@apollo/client'
import {ettlevColors, maxPageWidth, pageWidth} from '../util/theme'
import CustomizedTabs, {CustomizedTab} from '../components/common/CustomizedTabs'
import {PanelLink} from '../components/common/PanelLink'
import {bamseIcon, dokEtterlevelse} from '../components/Images'
import {env} from '../util/env'
import {InfoBlock2} from '../components/common/InfoBlock'

type Section = 'mine' | 'siste' | 'alle'

export const MyBehandlingerPage = () => {
  const [myBehandlinger, myBehandlingerLoading] = useMyBehandlinger()
  const [teams, teamsLoading] = useMyTeams()

  // const loggedIn = user.isLoggedIn()
  // const loading = myBehandlingerLoading || teamsLoading

  const [tab, setTab] = useState<Section>('mine')

  useEffect(() => {
    if (myBehandlingerLoading) return
    if (!myBehandlinger.length) setTab('siste')
  }, [myBehandlinger, myBehandlingerLoading])

  return (
    <Block width='100%' backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
      <Block maxWidth={maxPageWidth} width='100%'>
        {/*todo padding/pagestructure?*/}
        <Block paddingLeft={'100px'} paddingRight={'100px'}>

          <HeadingXXLarge marginTop={theme.sizing.scale900}>Dokumentere etterlevelse</HeadingXXLarge>

          <CustomizedTabs fontColor={ettlevColors.green800} small backgroundColor={ettlevColors.grey50}
                          activeKey={tab} onChange={args => setTab(args.activeKey as Section)}>

            <CustomizedTab key={'mine'} title={'Mine behandlinger'}>
              <MineBehandlinger teams={teams} behandlinger={myBehandlinger}/>
            </CustomizedTab>

            <CustomizedTab key={'siste'} title={'Mine sist dokumenterte'}>

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

const MineBehandlinger = ({behandlinger, teams}: {behandlinger: Behandling[], teams: Team[]}) => {
  return (
    <Block>
      {teams.map(t => {
          const teamBehandlinger = behandlinger.filter(b => b.teams.indexOf(t.id) >= 0)
          return <Block key={t.id} marginBottom={theme.sizing.scale1000}>
            <Block display={'flex'} justifyContent={'space-between'}>

              <Block>
                <HeadingLarge marginBottom={0} color={ettlevColors.green600}>{t.name}</HeadingLarge>
                <ParagraphSmall marginTop={0}>Teamet skal etterleve krav i <span style={{fontWeight: 700}}>{teamBehandlinger.length} behandlinger</span></ParagraphSmall>
              </Block>
              <Block alignSelf={'flex-end'}>
                <ExternalLink href={`${env.pollyBaseUrl}team/${t.id}`} hideUnderline>
                  <ParagraphSmall>Legg til behandling <FontAwesomeIcon icon={faExternalLinkAlt}/></ParagraphSmall>
                </ExternalLink>
              </Block>
            </Block>

            {teamBehandlinger.map(b => {
              return (
                <Block key={b.id} marginBottom={'8px'}>
                  <PanelLink
                    panelIcon={<img src={dokEtterlevelse} aria-hidden alt={'Dokumenter behandling ikon'}/>}
                    href={`/behandling/${b.id}`} title={b.navn} beskrivelse={b.overordnetFormaal.shortName}
                    rightBeskrivelse={'Sist endret: n/a'}

                  />
                </Block>
              )
            })}

          </Block>
        }
      )}

      <Block maxWidth={'800px'}>
        <InfoBlock2 icon={bamseIcon} alt={'Bamseikon'} title={'Savner du teamet ditt?'}
                    beskrivelse={'Legg til teamet i teamkatalogen, så henter vi behandlinger som skal etterleve krav'}

        >
          <Block marginTop={theme.sizing.scale600}>
            <ExternalLink href={`${env.teamKatBaseUrl}`} hideUnderline>
              <Button kind={'outline'} size={'compact'}>Teamkatalogen <FontAwesomeIcon icon={faExternalLinkAlt}/></Button>
            </ExternalLink>
          </Block>
        </InfoBlock2>
      </Block>

      <Block height={'200px'}/>

    </Block>
  )
}

const Alle = () => {
  const pageSize = 20
  const [pageNumber, setPage] = useState(0)
  const {data, loading: loadingAll} = useQuery<{behandlinger: PageResponse<Behandling>}>(query, {variables: {pageNumber, pageSize}})
  const allBehandlinger = data?.behandlinger || emptyPage
  const [search, setSearch, searchLoading, searchTerm] = useSearchBehandling()

  const prev = () => setPage(Math.max(0, pageNumber - 1))
  const next = () => setPage(Math.min(allBehandlinger?.pages ? allBehandlinger.pages - 1 : 0, pageNumber + 1))

  return (
    <Block maxWidth={pageWidth}>
      <HeadingMedium>Alle behandlinger</HeadingMedium>

      <Block maxWidth='500px' marginBottom={theme.sizing.scale1000}>
        <StatefulInput size='compact' placeholder='Søk' onChange={e => setSearch((e.target as HTMLInputElement).value)}
                       endEnhancer={
                         <Button onClick={() => setSearch('')} size='compact' kind='tertiary'><FontAwesomeIcon icon={faTimesCircle}/></Button>
                       }/>
        {searchLoading && <Block marginTop={theme.sizing.scale400}><Spinner size={theme.sizing.scale600}/></Block>}
      </Block>
      {!!searchTerm && <Block>
        <LabelSmall>Søkeresultat</LabelSmall>
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

const query = gql`
  query getBehandling($relevans: [String!], $pageNumber: NonNegativeInt, $pageSize: NonNegativeInt){
    behandlinger: behandling(filter: {relevans: $relevans}, pageNumber: $pageNumber, pageSize: $pageSize) {
      pageNumber
      pageSize
      pages
      content {
        id
        navn
        nummer
        overordnetFormaal {
          shortName
        }
      }

    }
  }
`
