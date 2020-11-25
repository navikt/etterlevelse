import {Block} from 'baseui/block'
import {H2} from 'baseui/typography'
import {useHistory, useParams} from 'react-router-dom'
import {KravId, mapToFormVal, useKrav} from '../api/KravApi'
import {Spinner} from '../components/common/Spinner'
import React, {useState} from 'react'
import {Krav, KravStatus} from '../constants'
import Button from '../components/common/Button'
import {ViewKrav} from '../components/krav/ViewKrav'
import {EditKrav} from '../components/krav/EditKrav'
import RouteLink from '../components/common/RouteLink'

export const kravName = (krav: Krav) => `${krav.kravNummer}.${krav.kravVersjon} - ${krav.navn}`

export const kravStatus = (status: KravStatus) => {
  switch (status) {
    case KravStatus.UNDER_REDIGERING:
      return 'Under redigering'
    case KravStatus.FERDIG:
      return 'Ferdig'
    default:
      return status
  }
}

export const KravPage = () => {
  const params = useParams<KravId>()
  const urlId = params.id
  const id = urlId === 'ny' ? undefined : urlId
  const [krav, setKrav] = useKrav(params, !id ? mapToFormVal({}) : undefined)
  const [edit, setEdit] = useState(urlId === 'ny')
  const history = useHistory()

  if (!edit && !krav) return <Spinner size={'40px'}/>

  const newVersion = () => {
    if (!krav) return
    setKrav({...krav, id: '', kravVersjon: krav.kravVersjon + 1, nyKravVersjon: true})
    setEdit(true)
  }

  return (
    <Block>

      <Block display='flex' justifyContent='space-between' alignItems='center'>
        <H2>Krav: {krav && krav?.kravNummer !== 0 ? kravName(krav) : 'Ny'}</H2>

        <Block>
          <RouteLink href={'/krav'}>
            <Button size='compact' kind='tertiary'>Tilbake</Button>
          </RouteLink>
          {krav?.id && !edit && <Button size='compact' kind='secondary' onClick={newVersion} marginLeft>Ny versjon</Button>}
          {krav?.id && <Button size='compact' onClick={() => setEdit(!edit)} marginLeft>{edit ? 'Avbryt' : 'Rediger'}</Button>}
        </Block>
      </Block>

      {!edit && krav && <ViewKrav krav={krav}/>}
      {edit && krav && <EditKrav krav={krav} close={k => {
        if (k) {
          setKrav(k)
          if (k.id !== id) {
            history.push(`/krav/${k.kravNummer}/${k.kravVersjon}`)
          }
        }
        setEdit(false)
      }}/>}
    </Block>
  )
}

