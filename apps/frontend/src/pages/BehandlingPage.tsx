import React from 'react'
import {Block} from 'baseui/block'
import {useParams} from 'react-router-dom'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'
import {behandlingName, useBehandling} from '../api/BehandlingApi'
import {StyledLink} from 'baseui/link'
import {behandlingLink} from '../util/config'
import {HeadingLarge, HeadingSmall, LabelMedium} from 'baseui/typography'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {theme} from '../util'
import {useEtterlevelseForBehandling} from '../api/EtterlevelseApi'
import {etterlevelseName} from './EtterlevelsePage'
import {ObjectLink} from '../components/common/RouteLink'
import {ObjectType} from '../components/admin/audit/AuditTypes'
import DataText from '../components/common/DataText'
import {Markdown} from '../components/common/Markdown'

export const BehandlingPage = () => {
  const params = useParams<{id?: string}>()
  const [behandling] = useBehandling(params.id)
  const etterlevelser = useEtterlevelseForBehandling(params.id)

  if (!behandling) return <LoadingSkeleton header='Krav'/>

  return (
    <Block>
      <HeadingLarge display='flex'>
        <Block marginRight={theme.sizing.scale1000}>Behandling - {behandlingName(behandling)}</Block>
        <StyledLink href={behandlingLink(behandling.id)} target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faExternalLinkAlt}/>
        </StyledLink>
      </HeadingLarge>

      <Block>
        <Label title='Navn'>{behandling.navn}</Label>
        <Label title='Nummer'>{behandling.nummer}</Label>
        <Label title='Overordnet formål'>{behandling.overordnetFormaal.shortName}</Label>
        <Label title=''>{behandling.overordnetFormaal.description}</Label>
        <Label title='Formål'>{behandling.formaal}</Label>

        <Label title='Avdeling'>{behandling.avdeling?.shortName}</Label>
        <Label title='Linjer'>{behandling.linjer.map(l => l.shortName).join(', ')}</Label>
        <Label title='Systemer'>{behandling.systemer.map(l => l.shortName).join(', ')}</Label>
        <Label title='Team'>{behandling.teams.join(', ')}</Label>
      </Block>

      <Block marginTop={theme.sizing.scale2400}>
        <HeadingSmall>Etterlevelser</HeadingSmall>

        {etterlevelser.map((e) => {
          return (
            <Block key={e.id}>
              <ObjectLink id={e.id} type={ObjectType.Etterlevelse}>
                <LabelMedium>{etterlevelseName(e)}</LabelMedium>
              </ObjectLink>
            </Block>
          )
        })}
      </Block>

    </Block>
  )
}


const Label = (props: {title: string, children?: React.ReactNode, markdown?: string | string[]}) => {
  return (
    <DataText label={props.title}>
      {props.markdown ?
        <Markdown sources={Array.isArray(props.markdown) ? props.markdown : [props.markdown]} noMargin shortenLinks/>
        : props.children}
    </DataText>
  )
}
