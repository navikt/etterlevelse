import {Block} from 'baseui/block'
import {HeadingLarge} from 'baseui/typography'
import {useHistory, useParams} from 'react-router-dom'
import {KravIdParams, useKrav} from '../api/KravApi'
import React, {useState} from 'react'
import {Krav, KravStatus} from '../constants'
import Button from '../components/common/Button'
import {ViewKrav} from '../components/krav/ViewKrav'
import {EditKrav} from '../components/krav/EditKrav'
import RouteLink from '../components/common/RouteLink'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'

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
  const params = useParams<KravIdParams>()
  const [krav, setKrav] = useKrav(params)
  const [edit, setEdit] = useState(krav && !krav.id)
  const history = useHistory()

  const loading = !edit && !krav

  const newVersion = () => {
    if (!krav) return
    setKrav({...krav, id: '', kravVersjon: krav.kravVersjon + 1, nyKravVersjon: true})
    setEdit(true)
  }

  return (
    <Block>
      {loading && <LoadingSkeleton header='Krav'/>}
      {!loading && <>
        <Block>
          <HeadingLarge>Krav: {krav && krav?.kravNummer !== 0 ? kravName(krav) : 'Ny'}</HeadingLarge>
          <Block display='flex' justifyContent='flex-end'>
            <RouteLink href={'/krav'}>
              <Button size='compact' kind='tertiary'>Tilbake</Button>
            </RouteLink>
            {krav?.id && !edit && <Button size='compact' kind='secondary' onClick={newVersion} marginLeft>Ny versjon</Button>}
            {krav?.id && <Button size='compact' onClick={() => setEdit(!edit)} marginLeft>{edit ? 'Avbryt' : 'Rediger'}</Button>}
          </Block>
        </Block>
      </>}

      {!edit && krav && !loading && <ViewKrav krav={krav}/>}
      {edit && krav && <EditKrav krav={krav} close={k => {
        if (k) {
          setKrav(k)
          if (k.id !== krav.id) {
            history.push(`/krav/${k.kravNummer}/${k.kravVersjon}`)
          }
        }
        setEdit(false)
      }}/>}
    </Block>
  )
}
