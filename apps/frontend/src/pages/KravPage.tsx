import {Block} from 'baseui/block'
import {HeadingLarge} from 'baseui/typography'
import {useHistory, useParams} from 'react-router-dom'
import {deleteKrav, KravIdParams, useKrav} from '../api/KravApi'
import React, {useEffect, useRef, useState} from 'react'
import {Krav, KravStatus} from '../constants'
import Button from '../components/common/Button'
import {ViewKrav} from '../components/krav/ViewKrav'
import {EditKrav} from '../components/krav/EditKrav'
import RouteLink from '../components/common/RouteLink'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'
import {user} from '../services/User'
import {theme} from '../util'
import {FormikProps} from 'formik'
import {DeleteItem} from '../components/DeleteItem'

export const kravNumView = (it: {kravVersjon: number, kravNummer: number}) => `K${it.kravNummer}.${it.kravVersjon}`
export const kravName = (krav: Krav) => `${kravNumView(krav)} - ${krav.navn}`

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
  const [krav, setKrav, reloadKrav] = useKrav(params)
  const [edit, setEdit] = useState(krav && !krav.id)
  const history = useHistory()
  const formRef = useRef<FormikProps<any>>()

  const loading = !edit && !krav

  const newVersion = () => {
    if (!krav) return
    setKrav({...krav, id: '', kravVersjon: krav.kravVersjon + 1, nyKravVersjon: true})
    setEdit(true)
  }

  useEffect(() => {
    // hent krav på ny ved avbryt ny versjon
    if (!edit && !krav?.id && krav?.nyKravVersjon) reloadKrav()
  }, [edit])

  return (
    <Block>
      {loading && <LoadingSkeleton header='Krav'/>}
      {!loading && <>
        <Block>
          <HeadingLarge>Krav: {krav && krav?.kravNummer !== 0 ? kravName(krav) : 'Ny'}</HeadingLarge>
          <Block display='flex' justifyContent='flex-end' marginBottom={theme.sizing.scale600}>
            <RouteLink href={'/krav'}>
              <Button size='compact' kind='tertiary'>Tilbake</Button>
            </RouteLink>
            {krav?.id && user.isKraveier() && !edit && <Button size='compact' kind='secondary' onClick={newVersion} marginLeft>Ny versjon av krav</Button>}
            {krav?.id && user.isKraveier() && <DeleteItem fun={() => deleteKrav(krav.id)} redirect={'/krav'}/>}
            {(edit || (krav?.id && user.isKraveier())) && <Button size='compact' onClick={() => setEdit(!edit)} marginLeft>{edit ? 'Avbryt' : 'Rediger'}</Button>}
            {edit && <Button size='compact' onClick={() => !formRef.current?.isSubmitting && formRef.current?.submitForm()} marginLeft>Lagre</Button>}
          </Block>
        </Block>
      </>}

      {!edit && krav && !loading && <ViewKrav krav={krav}/>}
      {edit && krav && <EditKrav krav={krav} formRef={formRef} close={k => {
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
