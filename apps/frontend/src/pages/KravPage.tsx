import {Block} from 'baseui/block'
import {HeadingLarge, HeadingSmall} from 'baseui/typography'
import {useHistory, useParams} from 'react-router-dom'
import {deleteKrav, KravIdParams, useKrav} from '../api/KravApi'
import React, {useEffect, useRef, useState} from 'react'
import {Krav, KravGraphQL, KravStatus} from '../constants'
import Button from '../components/common/Button'
import {ViewKrav} from '../components/krav/ViewKrav'
import {EditKrav} from '../components/krav/EditKrav'
import RouteLink, {ObjectLink} from '../components/common/RouteLink'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'
import {user} from '../services/User'
import {theme} from '../util'
import {FormikProps} from 'formik'
import {DeleteItem} from '../components/DeleteItem'
import {Cell, Row, Table} from '../components/common/Table'
import {Spinner} from '../components/common/Spinner'
import {gql} from 'graphql.macro'
import {Teams} from '../components/common/TeamName'
import {marginAll} from '../components/common/Style'
import {ObjectType} from '../components/admin/audit/AuditTypes'
import {behandlingName} from '../api/BehandlingApi'
import {etterlevelseStatus} from './EtterlevelsePage'
import {useQuery} from '@apollo/client'

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
  const {loading: etterlevelserLoading, data: ettlevQuery} = useQuery<{kravById: KravGraphQL}>(query, {
    variables: {id: krav?.id},
    skip: !krav?.id
  })
  const [edit, setEdit] = useState(krav && !krav.id)
  const history = useHistory()
  const formRef = useRef<FormikProps<any>>()

  const loadingKrav = !edit && !krav

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
      {loadingKrav && <LoadingSkeleton header='Krav'/>}
      {!loadingKrav && <>
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

      {!edit && krav && !loadingKrav &&
      <Block>
        <ViewKrav krav={krav}/>

        <Block>
          <HeadingSmall>Kravet etterleves av</HeadingSmall>
          <Block $style={{...marginAll('-' + theme.sizing.scale600)}}>
            {etterlevelserLoading && <Spinner size={theme.sizing.scale800}/>}
            {!etterlevelserLoading &&
            <Table data={ettlevQuery?.kravById.etterlevelser || []} emptyText='etterlevelser' headers={[
              {title: 'Behandling'},
              {title: 'Status'},
              {title: 'System'},
              {title: 'Team'},
              {title: 'Avdeling'}
            ]} render={state =>
              state.data.map(etterlevelse =>
                <Row key={etterlevelse.id}>
                  <Cell><ObjectLink type={ObjectType.Behandling} id={etterlevelse.behandling.id}>{behandlingName(etterlevelse.behandling)}</ObjectLink></Cell>
                  <Cell><ObjectLink type={ObjectType.Etterlevelse} id={etterlevelse.id}>
                    {etterlevelseStatus(etterlevelse.status)}
                  </ObjectLink></Cell>
                  <Cell>{etterlevelse.behandling.systemer.map(s => s.shortName).join(", ")}</Cell>
                  <Cell><Teams teams={etterlevelse.behandling.teams} link/></Cell>
                  <Cell>{etterlevelse.behandling.avdeling?.shortName}</Cell>
                </Row>
              )
            }/>}
          </Block>
        </Block>
      </Block>}

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

const query = gql`
  query getEtterlelser($id: ID!) {
    kravById(id: $id) {
      etterlevelser {
        id
        behandling {
          id
          nummer
          navn
          overordnetFormaal {
            shortName
          }
          systemer {
            code
            shortName
          }
          avdeling {
            code
            shortName
          }
          teams
        }
        status
      }
    }
  }`
