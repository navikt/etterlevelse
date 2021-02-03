import {Block} from 'baseui/block'
import {HeadingLarge, HeadingSmall, ParagraphMedium, ParagraphXSmall} from 'baseui/typography'
import {useHistory, useParams} from 'react-router-dom'
import {deleteKrav, KravIdParams, mapToFormVal} from '../api/KravApi'
import React, {useEffect, useRef, useState} from 'react'
import {EtterlevelseQL, Krav, KravQL, KravStatus, Rolle, Tilbakemelding} from '../constants'
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
import {useTilbakemeldinger} from '../api/TilbakemeldingApi'
import {PersonName} from '../components/common/PersonName'
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import {Card, CardOverrides} from 'baseui/card'
import {colors} from 'baseui/tokens'

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
  const [krav, setKrav] = useState<KravQL | undefined>()
  const {loading: kravLoading, data: kravQuery, refetch: reloadKrav} = useQuery<{kravById: KravQL}, KravIdParams>(query, {
    variables: params,
    skip: !params?.id && params.id !== 'ny' && !params.kravNummer
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
    <Block>
      {kravLoading && <LoadingSkeleton header='Krav'/>}
      {!kravLoading && <>
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
              <Cell>{etterlevelse.behandling.systemer.map(s => s.shortName).join(", ")}</Cell>
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


const Tilbakemeldinger = (props: {krav: Krav}) => {
  const [tilbakemeldinger, loading] = useTilbakemeldinger(props.krav.kravNummer, props.krav.kravVersjon)
  const [focusNr, setFocusNr] = useState<string>()

  return (
    <Block marginTop={theme.sizing.scale2400}>
      <HeadingSmall>Tilbakemeldinger</HeadingSmall>
      <Block $style={{...marginAll('-' + theme.sizing.scale600)}}>
        {loading && <Spinner size={theme.sizing.scale800}/>}
        {!loading &&
        <Table data={tilbakemeldinger} emptyText='tilbakemeldinger' headers={[
          {title: 'Tittel'},
          {title: 'Type'},
          {title: 'Melder'},
          {title: 'Meldinger'},
        ]} render={state =>
          state.data.map(tilbakemelding => {
              const focused = tilbakemelding.id === focusNr
              return (
                <React.Fragment key={tilbakemelding.id}>
                  <Row>
                    <Cell>{tilbakemelding.tittel}</Cell>
                    <Cell>{tilbakemelding.type}</Cell>
                    <Cell><PersonName ident={tilbakemelding.melderIdent}/></Cell>
                    <Cell>
                      <Block display='flex' justifyContent='space-between' width='100%' alignItems='center'>
                        <Block>
                          {tilbakemelding.meldinger.length}
                        </Block>
                        <Block>
                          <Button kind='tertiary' size='compact' onClick={() => focused ? setFocusNr(undefined) : setFocusNr(tilbakemelding.id)} icon={faPlus}/>
                        </Block>
                      </Block>
                    </Cell>
                  </Row>
                  {focused && <MessageList tilbakemelding={tilbakemelding}/>}
                </React.Fragment>
              )
            }
          )
        }/>}
      </Block>
    </Block>
  )
}

const meldingCardOverrides = (isUser: boolean): CardOverrides => ({
  Root: {
    style: {
      marginTop: theme.sizing.scale400,
      width: 'fit-content',
      maxWidth: '80%',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      backgroundColor: isUser ? theme.colors.inputFillActive : theme.colors.mono100,
      borderRadius: '10px',
      borderWidth: 0
    }
  }
})

const MessageList = ({tilbakemelding}: {tilbakemelding: Tilbakemelding}) => {
  const userRole = tilbakemelding.melderIdent === user.getIdent() ? Rolle.MELDER : Rolle.KRAVEIER

  return (
    <Block padding={theme.sizing.scale600} width='100%' maxWidth='700px' display='flex' flexDirection='column' backgroundColor={colors.gray50}>
      {tilbakemelding.meldinger.map(melding => {
        return (
          <Card key={melding.meldingNr} overrides={meldingCardOverrides(melding.rolle === userRole)}>
            <Block display='flex' flexDirection='column'>
              <ParagraphMedium marginTop={0} marginBottom={0}>{melding.innhold}</ParagraphMedium>
              <ParagraphXSmall alignSelf={melding.rolle === userRole ? 'flex-end' : 'flex-start'} marginBottom={0}>
                <PersonName ident={melding.fraIdent}/> {moment(melding.tid).format('lll')}
              </ParagraphXSmall>
            </Block>
          </Card>
        )
      })}
      {/*{tilbakemelding.meldinger.map(melding => (*/}
      {/*  <Block key={melding.meldingNr} marginBottom={melding.meldingNr < tilbakemelding.meldinger.length ? theme.sizing.scale1000 : undefined}>*/}
      {/*    <Label title='Nr' compact>{melding.meldingNr}</Label>*/}
      {/*    <Label title='Melding' compact>{melding.innhold}</Label>*/}
      {/*    <Label title='Fra' compact>{melding.rolle}: <PersonName ident={melding.fraIdent}/></Label>*/}
      {/*    <Label title='Tidspunkt' compact>{moment(melding.tid).format('lll')}</Label>*/}
      {/*  </Block>*/}
      {/*))}*/}
    </Block>
  )
}
