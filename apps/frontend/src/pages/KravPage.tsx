import {Block} from 'baseui/block'
import {HeadingLarge, HeadingSmall} from 'baseui/typography'
import {useHistory, useParams} from 'react-router-dom'
import {deleteKrav, KravIdParams, mapToFormVal} from '../api/KravApi'
import React, {useEffect, useRef, useState} from 'react'
import {EtterlevelseQL, Krav, KravQL, KravStatus} from '../constants'
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
import {Teams} from '../components/common/TeamName'
import {marginAll} from '../components/common/Style'
import {ObjectType} from '../components/admin/audit/AuditTypes'
import {behandlingName} from '../api/BehandlingApi'
import {etterlevelseStatus} from './EtterlevelsePage'
import {gql, useQuery} from '@apollo/client'
import {Tilbakemeldinger} from '../components/krav/Tilbakemelding'

export const kravNumView = (it: {kravVersjon: number, kravNummer: number}) => `K${it.kravNummer}.${it.kravVersjon}`
export const kravName = (krav: Krav) => `${kravNumView(krav)} - ${krav.navn}`

export const kravStatus = (status: KravStatus) => {
  if (!status) return ''
  switch (status) {
    case KravStatus.UTKAST:
      return 'Utkast'
    case KravStatus.UNDER_ARBEID:
      return 'Under arbeid'
    case KravStatus.AKTIV:
      return 'Aktiv'
    case KravStatus.UTGAATT:
      return 'Utgått'
    default:
      return status
  }
}

export const KravPage = () => {
  const params = useParams<KravIdParams>()
  const [krav, setKrav] = useState<KravQL | undefined>()
  const {loading: kravLoading, data: kravQuery, refetch: reloadKrav} = useQuery<{kravById: KravQL}, KravIdParams>(query, {
    variables: params,
    skip: (!params.id || params.id === 'ny') && !params.kravNummer
  })
  useEffect(() => {
    if (kravQuery?.kravById) setKrav(kravQuery.kravById)
  }, [kravQuery])

  useEffect(() => {
    if (params.id === 'ny') {
      setKrav(mapToFormVal({}) as KravQL)
      setEdit(true)
    }
  }, [params.id])

  // todo split loading krav and subelements?
  const etterlevelserLoading = kravLoading

  const [edit, setEdit] = useState(krav && !krav.id)
  const history = useHistory()
  const formRef = useRef<FormikProps<any>>()

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
    <Block width='100%'>
      {kravLoading && <LoadingSkeleton header='Krav'/>}
      {!kravLoading && <>
        <Block>
          <HeadingLarge>Krav: {krav && krav?.kravNummer !== 0 ? kravName(krav) : 'Ny'}</HeadingLarge>
          <Block display='flex' justifyContent='flex-end' marginBottom={theme.sizing.scale600}>
            <RouteLink href={'/krav'}>
              <Button size='compact' kind='tertiary'>Tilbake</Button>
            </RouteLink>
            {krav?.id && user.isKraveier() && !edit && <Button size='compact' kind='secondary' onClick={newVersion} marginLeft>Ny versjon av krav</Button>}
            {krav?.id && user.isKraveier() && !edit && <DeleteItem fun={() => deleteKrav(krav.id)} redirect={'/krav'}/>}
            {(edit || (krav?.id && user.isKraveier())) &&
            <Button size='compact' kind={edit ? 'secondary' : 'primary'} onClick={() => setEdit(!edit)} marginLeft>{edit ? 'Avbryt' : 'Rediger'}</Button>}
            {edit && <Button size='compact' onClick={() => !formRef.current?.isSubmitting && formRef.current?.submitForm()} marginLeft>Lagre</Button>}
          </Block>
        </Block>
      </>}

      {!edit && krav && !kravLoading &&
      <Block>
        <ViewKrav krav={krav}/>
        <Etterlevelser loading={etterlevelserLoading} etterlevelser={krav.etterlevelser}/>
        <Tilbakemeldinger krav={krav}/>
      </Block>}

      {edit && krav && <EditKrav krav={krav} formRef={formRef} close={k => {
        if (k) {
          if (k.id !== krav.id) {
            history.push(`/krav/${k.kravNummer}/${k.kravVersjon}`)
          } else {
            reloadKrav()
          }
        }
        setEdit(false)
      }}/>}

    </Block>
  )
}

const Etterlevelser = ({loading, etterlevelser}: {loading: boolean, etterlevelser?: EtterlevelseQL[]}) => {

  return (
    <Block>
      <HeadingSmall>Kravet etterleves av</HeadingSmall>
      <Block $style={{...marginAll('-' + theme.sizing.scale600)}}>
        {loading && <Spinner size={theme.sizing.scale800}/>}
        {!loading &&
        <Table data={etterlevelser || []} emptyText='etterlevelser' headers={[
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
              <Cell>{etterlevelse.behandling.systemer.map(s => s.shortName).join(', ')}</Cell>
              <Cell><Teams teams={etterlevelse.behandling.teams} link/></Cell>
              <Cell>{etterlevelse.behandling.avdeling?.shortName}</Cell>
            </Row>
          )
        }/>}
      </Block>
    </Block>
  )
}

const query = gql`
  query getKravWithEtterlevelse($id: ID, $kravNummer: Int, $kravVersjon: Int) {
    kravById(id: $id, nummer: $kravNummer, versjon: $kravVersjon) {
      id
      kravNummer
      kravVersjon

      navn
      beskrivelse
      hensikt
      utdypendeBeskrivelse
      versjonEndringer

      dokumentasjon
      implementasjoner
      begreper
      varslingsadresser {
        adresse
        type
        slackChannel {
          id
          name
          numMembers
        }
        slackUser {
          id
          name
        }
      }
      rettskilder
      regelverk {
        lov {
          code
          shortName
        }
        spesifisering
      }
      tagger
      periode {
        start
        slutt
      }

      avdeling {
        code
        shortName
      }
      underavdeling {
        code
        shortName
      }
      relevansFor {
        code
        shortName
      }
      status

      suksesskriterier {
        id
        navn
      }

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

