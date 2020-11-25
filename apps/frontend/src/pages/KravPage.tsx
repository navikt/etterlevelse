import {Block} from 'baseui/block'
import {H2} from 'baseui/typography'
import {useParams} from 'react-router-dom'
import {useKrav} from '../api/KravApi'
import {Spinner} from '../components/common/Spinner'
import React, {useState} from 'react'
import {Krav, KravStatus} from '../constants'
import Button from '../components/common/Button'
import {ViewKrav} from '../components/krav/ViewKrav'
import {EditKrav} from '../components/krav/EditKrav'

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
  const id = useParams<{id: string}>().id
  const [krav, setKrav] = useKrav(id)
  const [edit, setEdit] = useState(false)

  if (!edit && !krav) return <Spinner size={'40px'}/>

  return (
    <Block>

      <Block display='flex' justifyContent='space-between' alignItems='center'>
        <H2>Krav: {kravName(krav)}</H2>

        <Block>
          <Button size='compact' onClick={() => setEdit(!edit)}>{edit ? 'Avbryt' : 'Rediger'}</Button>
        </Block>
      </Block>

      {!edit && krav && <ViewKrav krav={krav}/>}

      {edit && krav && <EditKrav krav={krav} close={k => {
        k && setKrav(k)
        setEdit(false)
      }}/>}
    </Block>
  )
}

