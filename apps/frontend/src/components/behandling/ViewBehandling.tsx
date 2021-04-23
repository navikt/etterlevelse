import {Block} from 'baseui/block'
import React, {useEffect, useState} from 'react'
import {theme} from '../../util'
import {Teams} from '../common/TeamName'
import {DotTags} from '../common/DotTag'
import {Code, ListName} from '../../services/Codelist'
import {HeadingSmall} from 'baseui/typography'
import RouteLink, {ObjectLink} from '../common/RouteLink'
import {etterlevelseName, etterlevelseStatus} from '../../pages/EtterlevelsePage'
import {Behandling, Etterlevelse, EtterlevelseStatus, KravQL, PageResponse} from '../../constants'
import {Label} from '../common/PropertyLabel'
import {KravFilters} from '../../api/KravGraphQLApi'
import {Spinner} from '../common/Spinner'
import {Cell, Row, Table} from '../common/Table'
import moment from 'moment'
import Button from '../common/Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEdit, faEye, faPlus} from '@fortawesome/free-solid-svg-icons'
import {Modal, ModalBody, ModalHeader} from 'baseui/modal'
import {EditEtterlevelse} from '../etterlevelse/EditEtterlevelse'
import {useEtterlevelse} from '../../api/EtterlevelseApi'
import {kravFullQuery, KravId} from '../../api/KravApi'
import {ViewKrav} from '../krav/ViewKrav'
import {kravName, kravNumView} from '../../pages/KravPage'
import {ViewEtterlevelse} from '../etterlevelse/ViewEtterlevelse'
import {ObjectType} from '../admin/audit/AuditTypes'
import {gql, useQuery} from '@apollo/client'
import {Chart} from '../Chart'

const filterForBehandling = (behandling: Behandling): KravFilters => ({behandlingId: behandling.id})

export const ViewBehandling = ({behandling}: {behandling: Behandling}) => {

  return (
    <Block>
      <Block>
        <Label title='Navn'>{behandling.navn}</Label>
        <Label title='Nummer'>{behandling.nummer}</Label>
        <Label title='Overordnet formål'>{behandling.overordnetFormaal.shortName}</Label>
        <Label title=''>{behandling.overordnetFormaal.description}</Label>
        <Label title='Formål'>{behandling.formaal}</Label>

        <Label title='Avdeling'>{behandling.avdeling?.shortName}</Label>
        <Label title='Linjer'>{behandling.linjer.map(l => l.shortName).join(', ')}</Label>
        <Label title='Systemer'>{behandling.systemer.map(l => l.shortName).join(', ')}</Label>
        <Label title='Team'>
          <Teams teams={behandling.teams} link/>
        </Label>
        <Label title={'Relevans'}><DotTags list={ListName.RELEVANS} codes={behandling.relevansFor} linkCodelist/></Label>
      </Block>

      <BehandlingStatsView behandling={behandling}/>
      <KravTable behandling={behandling}/>

    </Block>
  )
}

const behandlingKravQuery = gql`
  query getKravByFilter ($behandlingId: String!) {
    krav(filter: {behandlingId: $behandlingId}) {
      content{
        id
        navn
        kravNummer
        kravVersjon
        etterlevelser (onlyForBehandling: true) {
          id
          etterleves
          fristForFerdigstillelse
          status
        }
      }
    }
  }`

type KravTableData = {
  kravNummer: number
  kravVersjon: number
  navn: string
  etterlevelseId?: string
  etterleves: boolean
  frist?: string
  etterlevelseStatus?: EtterlevelseStatus
}

const KravTable = (props: {behandling: Behandling}) => {
  const variables = filterForBehandling(props.behandling)
  const {data: rawData, loading} = useQuery<{krav: PageResponse<KravQL>}>(behandlingKravQuery, {
    variables,
    skip: !variables?.behandlingId
  })
  const [data, setData] = useState<KravTableData[]>([])

  useEffect(() => {
    const mapped = (rawData?.krav.content || []).map(krav => {
      const etterlevelse = krav.etterlevelser.length ? krav.etterlevelser[0] : undefined
      return ({
        kravNummer: krav.kravNummer,
        kravVersjon: krav.kravVersjon,
        navn: krav.navn,
        ...mapEtterlevelseData(etterlevelse)
      })
    })
    setData(mapped)
  }, [rawData])

  const [viewEtterlevelse, setViewEtterlevelse] = useState<string | undefined>()
  const [edit, setEdit] = useState<string | undefined>()
  const [kravId, setKravId] = useState<KravId | undefined>()

  const mapEtterlevelseData = (etterlevelse?: Etterlevelse) => ({
    etterlevelseId: etterlevelse?.id,
    etterleves: !!etterlevelse?.etterleves,
    frist: etterlevelse?.fristForFerdigstillelse,
    etterlevelseStatus: etterlevelse?.status
  })
  const update = (etterlevelse: Etterlevelse) => {
    setData(data.map(e => e.kravVersjon === etterlevelse.kravVersjon && e.kravNummer === etterlevelse.kravNummer ? {...e, ...mapEtterlevelseData(etterlevelse)} : e))
  }

  const head = <HeadingSmall marginBottom={theme.sizing.scale400}>Krav for behandling</HeadingSmall>


  return (
    loading ?
      <Block marginTop={theme.sizing.scale2400}>
        {head}
        <Spinner size={theme.sizing.scale2400}/>
      </Block> :
      <Block marginTop={theme.sizing.scale2400}>
        {head}
        <Table
          data={data}
          emptyText={'data på behandling som spesifiserer aktuelle krav'}
          headers={[
            {title: 'Nummer', column: 'kravNummer', small: true},
            {title: 'Navn', column: 'navn'},
            {title: 'Etterleves', column: 'etterleves'},
            {title: 'Frist', column: 'frist'},
            {title: 'Status', column: 'etterlevelseStatus'},
            {title: '', small: true},
          ]}
          config={{
            initialSortColumn: 'kravNummer',
            useDefaultStringCompare: true,
            sorting: {
              kravNummer: (a, b) => a.kravNummer === b.kravNummer ? a.kravVersjon - b.kravVersjon : a.kravNummer - b.kravNummer,
              etterleves: (a, b) => a.etterleves ? b.etterleves ? 0 : -1 : 1
            }
          }}
          render={state => {
            return state.data.map((krav, i) => {
              return (
                <Row key={i}>
                  <Cell small>{kravNumView(krav)}</Cell>
                  <Cell>
                    <RouteLink href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}>{krav.navn}</RouteLink>
                  </Cell>
                  <Cell>
                    {krav.etterleves ? 'Ja' : 'Nei'}
                  </Cell>
                  <Cell>{krav.frist && moment(krav.frist).format('ll')}</Cell>
                  <Cell>{etterlevelseStatus(krav.etterlevelseStatus)}</Cell>
                  <Cell small $style={{justifyContent: 'flex-end'}}>
                    {krav.etterlevelseId &&
                    <Button tooltip='Vis etterlevelse' size='compact' kind='tertiary' onClick={() => setViewEtterlevelse(krav.etterlevelseId)}><FontAwesomeIcon
                      icon={faEye}/></Button>}

                    {krav.etterlevelseId &&
                    <Button tooltip='Rediger' size='compact' kind='tertiary' onClick={() => setEdit(krav.etterlevelseId)}><FontAwesomeIcon icon={faEdit}/></Button>}
                    {!krav.etterlevelseId && <Button tooltip='Opprett' size='compact' kind='tertiary' onClick={() => {
                      setKravId(toKravId(krav))
                      setEdit('ny')
                    }}><FontAwesomeIcon icon={faPlus}/></Button>}
                  </Cell>
                </Row>
              )
            })
          }}
        />
        <Modal isOpen={!!viewEtterlevelse} onClose={() => setViewEtterlevelse(undefined)} unstable_ModalBackdropScroll>
          <EtterlevelseModal id={viewEtterlevelse}/>
        </Modal>
        {edit &&
        <Modal isOpen={!!edit}
               onClose={() => setEdit(undefined)}
               unstable_ModalBackdropScroll
               overrides={{
                 Dialog: {
                   style: {
                     width: '70vw'
                   }
                 }
               }}
        >
          <ModalHeader>{edit === 'ny' ? 'Ny' : 'Rediger'} etterlevelse</ModalHeader>
          <ModalBody>
            <EditModal etterlevelseId={edit} behandlingId={props.behandling.id} kravId={kravId} close={e => {
              setEdit(undefined)
              e && update(e)
            }}/>
          </ModalBody>
        </Modal>
        }
      </Block>
  )
}

const EtterlevelseModal = (props: {id?: string}) => {
  const [etterlevelse] = useEtterlevelse(props.id)
  if (!etterlevelse) return <Spinner size={theme.sizing.scale800}/>
  return <>
    <ModalHeader>
      <ObjectLink type={ObjectType.Etterlevelse} id={props.id}>
        <Block marginRight={theme.sizing.scale400}>Etterlevelse av {etterlevelseName(etterlevelse)}</Block>
      </ObjectLink>
    </ModalHeader>
    <ModalBody>
      <ViewEtterlevelse etterlevelse={etterlevelse}/>
    </ModalBody>
  </>
}

const toKravId = (it: {kravVersjon: number, kravNummer: number}) => ({kravNummer: it.kravNummer, kravVersjon: it.kravVersjon})

const EditModal = (props: {etterlevelseId: string, behandlingId: string, kravId?: KravId, close: (e?: Etterlevelse) => void}) => {
  const [etterlevelse] = useEtterlevelse(props.etterlevelseId, props.behandlingId, props.kravId)
  if (!etterlevelse) return <Spinner size={theme.sizing.scale800}/>

  return (
    <Block>
      {etterlevelse && <KravView kravId={toKravId(etterlevelse)}/>}
      <EditEtterlevelse
        etterlevelse={etterlevelse}
        lockBehandlingAndKrav
        close={e => {
          props.close(e)
        }}/>
    </Block>
  )
}

const KravView = (props: {kravId: KravId}) => {
  const {data} = useQuery<{kravById: KravQL}, KravId>(kravFullQuery, {
    variables: props.kravId,
    skip: !props.kravId.id && !props.kravId.kravNummer
  })
  const [view, setView] = useState(false)
  const krav = data?.kravById

  return (
    <Block>
      <Block display='flex' justifyContent='space-between' alignItems='center'>
        {krav && <HeadingSmall>Krav: {kravNumView(krav)}</HeadingSmall>}
        <Block>
          <Button type='button' size='compact' onClick={() => setView(!view)}>{`${(view ? 'Skjul' : 'Vis')} detaljer`}</Button>
        </Block>
      </Block>
      {krav && view &&
      <Block>
        <ViewKrav krav={krav}/>
      </Block>
      }
    </Block>
  )
}

const statsQuery = gql`
  query getBehandlingStats($behandlingId: ID!) {
    behandling(filter: { id: $behandlingId }) {
      content {
        stats {
          fyltKrav {
            kravNummer
            kravVersjon
            regelverk {
              lov {
                code
                shortName
              }
            }
          }
          ikkeFyltKrav {
            kravNummer
            kravVersjon
            regelverk {
              lov {
                code
                shortName
              }
            }
          }
          lovStats {
            lovCode {
              code
              shortName
            }
            fyltKrav {
              id
              kravNummer
              kravVersjon
              navn
            }
            ikkeFyltKrav {
              id
              kravNummer
              kravVersjon
              navn
            }
          }
        }
      }
    }
  }`


const BehandlingStatsView = ({behandling}: {behandling: Behandling}) => {
  const {data} = useQuery<{behandling: PageResponse<{stats: BehandlingStats}>}>(statsQuery, {
    variables: {behandlingId: behandling.id}
  })
  const stats = data?.behandling.content[0].stats
  const [expand, setExpand] = useState<string | undefined>()

  const head = <HeadingSmall marginBottom={theme.sizing.scale800}>Stats</HeadingSmall>
  if (!stats) return <Block marginTop={theme.sizing.scale2400}>
    {head}
    <Spinner size={theme.sizing.scale800}/>
  </Block>

  return (
    <Block marginTop={theme.sizing.scale2400}>
      {head}
      <Block display='flex' width='100%' marginTop={theme.sizing.scale800} alignItems='center'>

        <Chart title='Krav totalt' data={[
          {label: 'Utfylt', size: stats.fyltKrav.length},
          {label: 'Ikke utfylt', size: stats.ikkeFyltKrav.length},
        ]} size={75}/>

        <Block $style={{flexGrow: 1}} marginLeft={theme.sizing.scale400}>
          <Table data={stats.lovStats.map(lov => ({
            label: lov.lovCode.shortName,
            fylt: lov.fyltKrav,
            ikkeFylt: lov.ikkeFyltKrav,
            empty: !lov.fyltKrav.length && !lov.ikkeFyltKrav.length,
            code: lov.lovCode.code
          }))} emptyText={'krav'} headers={[
            {title: 'Lov',},
            {title: 'Utfylt',},
            {title: 'Ikke utfylt',},
          ]} render={state => state.data
          .filter(lov => !lov.empty)
          .map((lov, i) => {
            const expanded = expand === lov.code
            return (
              <div key={i} onClick={() => expanded ? setExpand(undefined) : setExpand(lov.code)} style={{cursor: 'pointer'}}>
                <Row>
                  <Cell>{lov.label}</Cell>
                  <Cell>{lov.fylt.length}</Cell>
                  <Cell>{lov.ikkeFylt.length}</Cell>
                </Row>
                {expanded && lov.fylt.map(k => (
                  <Row key={k.id} $style={{backgroundColor: theme.colors.positive50}}>
                    <Cell small>Utfylt</Cell>
                    <Cell $style={{justifyContent: 'flex-end'}}><ObjectLink type={ObjectType.Krav} id={k.id}>{kravName(k)}</ObjectLink></Cell>
                  </Row>
                ))}
                {expanded && lov.ikkeFylt.map(k => (
                  <Row key={k.id} $style={{backgroundColor: theme.colors.warning50}}>
                    <Cell small>Ikke utfylt</Cell>
                    <Cell $style={{justifyContent: 'flex-end'}}><ObjectLink type={ObjectType.Krav} id={k.id}>{kravName(k)}</ObjectLink></Cell>
                  </Row>
                ))}
              </div>
            )
          })}/>
        </Block>
      </Block>
    </Block>
  )
}

interface BehandlingStats {
  fyltKrav: KravQL[]
  ikkeFyltKrav: KravQL[]
  lovStats: LovStats[]
}

interface LovStats {
  lovCode: Code
  fyltKrav: KravQL[]
  ikkeFyltKrav: KravQL[]
}
