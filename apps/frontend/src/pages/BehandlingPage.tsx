import React, {useRef, useState} from 'react'
import {Block} from 'baseui/block'
import {useParams} from 'react-router-dom'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'
import {behandlingName, useBehandling} from '../api/BehandlingApi'
import {StyledLink} from 'baseui/link'
import {behandlingLink} from '../util/config'
import {HeadingLarge} from 'baseui/typography'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import RouteLink from '../components/common/RouteLink'
import Button from '../components/common/Button'
import {ViewBehandling} from '../components/behandling/ViewBehandling'
import {EditBehandling} from '../components/behandling/EditBehandling'
import {theme} from '../util'
import {user} from '../services/User'
import {FormikProps} from 'formik'
import {maxPageWidth} from '../util/theme'

export const BehandlingPage = () => {
  const params = useParams<{ id?: string }>()
  const [behandling, setBehandling] = useBehandling(params.id)
  const [edit, setEdit] = useState(false)
  const formRef = useRef<FormikProps<any>>()

  if (!behandling) return <LoadingSkeleton header='Behandling' />

  return (
    <Block maxWidth={maxPageWidth} width='100%'>
      <Block paddingLeft='40px' paddingRight='40px' width='calc(100%-80px)'>
        <Block>
          <HeadingLarge display='flex'>
            <Block marginRight={theme.sizing.scale400}>Behandling: {behandlingName(behandling)}</Block>
            <StyledLink href={behandlingLink(behandling.id)} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon size={'sm'} icon={faExternalLinkAlt} />
            </StyledLink>
          </HeadingLarge>
          <Block display='flex' justifyContent='flex-end' marginBottom={theme.sizing.scale600}>
            <RouteLink href={'/behandlinger'}>
              <Button size='compact' kind='tertiary'>Tilbake</Button>
            </RouteLink>
            {user.canWrite() &&
              <Button size='compact' kind={edit ? 'secondary' : 'primary'} onClick={() => setEdit(!edit)} marginLeft>{edit ? 'Avbryt' : 'Rediger'}</Button>}
            {edit && <Button size='compact' onClick={() => !formRef.current?.isSubmitting && formRef.current?.submitForm()} marginLeft>Lagre</Button>}
          </Block>
        </Block>

        {!edit && <ViewBehandling behandling={behandling} />}
        {edit && <EditBehandling behandling={behandling} formRef={formRef} close={k => {
          if (k) setBehandling({ ...behandling, ...k })
          setEdit(false)
        }} />
        }
      </Block>
    </Block>
  )
}
