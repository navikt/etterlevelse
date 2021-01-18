import {Block} from 'baseui/block'
import {HeadingLarge} from 'baseui/typography'
import {useHistory, useParams} from 'react-router-dom'
import {deleteEtterlevelse, useEtterlevelse} from '../api/EtterlevelseApi'
import React, {useRef, useState} from 'react'
import {Etterlevelse, EtterlevelseStatus} from '../constants'
import Button from '../components/common/Button'
import {ViewEtterlevelse} from '../components/etterlevelse/ViewEtterlevelse'
import {EditEtterlevelse} from '../components/etterlevelse/EditEtterlevelse'
import RouteLink from '../components/common/RouteLink'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'
import {user} from '../services/User'
import {theme} from '../util'
import {FormikProps} from 'formik'
import {DeleteItem} from '../components/DeleteItem'

export const etterlevelseName = (etterlevelse: Etterlevelse) => `${etterlevelse.kravNummer}.${etterlevelse.kravVersjon} - ${etterlevelse.begrunnelse}`

export const etterlevelseStatus = (status?: EtterlevelseStatus) => {
  if (!status) return ''
  switch (status) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return 'Under redigering'
    case EtterlevelseStatus.FERDIG:
      return 'Ferdig'
    default:
      return status
  }
}

export const EtterlevelsePage = () => {
  const params = useParams<{id?: string}>()
  const [etterlevelse, setEtterlevelse] = useEtterlevelse(params.id)
  const [edit, setEdit] = useState(etterlevelse && !etterlevelse.id)
  const formRef = useRef<FormikProps<any>>()
  const history = useHistory()

  const loading = !edit && !etterlevelse

  return (
    <Block>
      {loading && <LoadingSkeleton header='Etterlevelse'/>}
      {!loading && <>
        <Block>
          <HeadingLarge>Etterlevelse: {etterlevelse && etterlevelse?.kravNummer !== 0 ? etterlevelseName(etterlevelse) : 'Ny'}</HeadingLarge>
          <Block display='flex' justifyContent='flex-end' marginBottom={theme.sizing.scale600}>
            <RouteLink href={'/etterlevelse'}>
              <Button size='compact' kind='tertiary'>Tilbake</Button>
            </RouteLink>
            {etterlevelse?.id && user.canWrite() && <Button size='compact' onClick={() => setEdit(!edit)} marginLeft>{edit ? 'Avbryt' : 'Rediger'}</Button>}
            {etterlevelse?.id && user.canWrite() && <DeleteItem fun={() => deleteEtterlevelse(etterlevelse.id)} redirect={'/etterlevelse'}/>}
            {edit && <Button size='compact' onClick={() => !formRef.current?.isSubmitting && formRef.current?.submitForm()} marginLeft>Lagre</Button>}
          </Block>
        </Block>
      </>}

      {!edit && etterlevelse && !loading && <ViewEtterlevelse etterlevelse={etterlevelse}/>}
      {edit && etterlevelse && <EditEtterlevelse etterlevelse={etterlevelse} formRef={formRef} close={k => {
        if (k) {
          setEtterlevelse(k)
          if (k.id !== etterlevelse.id) {
            history.push(`/etterlevelse/${k.id}`)
          }
        }
        setEdit(false)
      }}/>}
    </Block>
  )
}
