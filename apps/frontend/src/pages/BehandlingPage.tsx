import React, {useState} from 'react'
import {Block} from 'baseui/block'
import {useParams} from 'react-router-dom'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'
import {behandlingName, useBehandling} from '../api/BehandlingApi'
import {StyledLink} from 'baseui/link'
import {behandlingLink} from '../util/config'
import {HeadingLarge} from 'baseui/typography'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {useEtterlevelseForBehandling} from '../api/EtterlevelseApi'
import RouteLink from '../components/common/RouteLink'
import Button from '../components/common/Button'
import {ViewBehandling} from '../components/behandling/ViewBehandling'
import {EditBehandling} from '../components/behandling/EditBehandling'
import {theme} from '../util'

export const BehandlingPage = () => {
  const params = useParams<{id?: string}>()
  const [behandling, setBehandling] = useBehandling(params.id)
  const [edit, setEdit] = useState(false)
  const etterlevelser = useEtterlevelseForBehandling(params.id)

  if (!behandling) return <LoadingSkeleton header='Behandling'/>

  return (
    <Block>
      <Block>
        <HeadingLarge display='flex'>
          <Block marginRight={theme.sizing.scale400}>Behandling: {behandlingName(behandling)}</Block>
          <StyledLink href={behandlingLink(behandling.id)} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon size={'sm'} icon={faExternalLinkAlt}/>
          </StyledLink>
        </HeadingLarge>
        <Block display='flex' justifyContent='flex-end'>
          <RouteLink href={'/behandling'}>
            <Button size='compact' kind='tertiary'>Tilbake</Button>
          </RouteLink>
          <Button size='compact' onClick={() => setEdit(!edit)} marginLeft>{edit ? 'Avbryt' : 'Rediger'}</Button>
        </Block>
      </Block>

      {!edit && <ViewBehandling behandling={behandling} etterlevelser={etterlevelser}/>}
      {edit && <EditBehandling behandling={behandling} close={k => {
        if (k) setBehandling({...behandling, ...k})
        setEdit(false)
      }}/>
      }
    </Block>
  )
}
