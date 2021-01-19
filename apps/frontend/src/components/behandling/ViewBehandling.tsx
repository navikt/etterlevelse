import {Block} from 'baseui/block'
import React, {useEffect, useState} from 'react'
import {theme} from '../../util'
import {TeamName} from '../common/TeamName'
import {DotTags} from '../common/DotTag'
import {ListName} from '../../services/Codelist'
import {HeadingSmall} from 'baseui/typography'
import RouteLink, {ObjectLink} from '../common/RouteLink'
import {etterlevelseName, etterlevelseStatus} from '../../pages/EtterlevelsePage'
import {Behandling, Etterlevelse, EtterlevelseStatus} from '../../constants'
import {Label} from '../common/PropertyLabel'
import {KravFilters, useKravFilter} from '../../api/KravGraphQLApi'
import {Spinner} from '../common/Spinner'
import {Cell, Row, Table} from '../common/Table'
import moment from 'moment'
import Button from '../common/Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEdit, faEye, faPlus} from '@fortawesome/free-solid-svg-icons'
import {Modal, ModalBody, ModalHeader} from 'baseui/modal'
import {EditEtterlevelse} from '../etterlevelse/EditEtterlevelse'
import {useEtterlevelse} from '../../api/EtterlevelseApi'
import {KravId, useKrav} from '../../api/KravApi'
import {ViewKrav} from '../krav/ViewKrav'
import {kravName, kravNumView} from '../../pages/KravPage'
import {gql} from 'graphql.macro';
import {ViewEtterlevelse} from '../etterlevelse/ViewEtterlevelse'
import {ObjectType} from '../admin/audit/AuditTypes'

function filterForBehandling(behandling: Behandling): KravFilters {
  return {behandlingId: behandling.id}
}

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
          <Block display='flex' flexWrap>
            {behandling.teams.map(t =>
              <Block key={t} marginRight={theme.sizing.scale600}>
                <TeamName id={t} link/>
              </Block>
            )}
          </Block>
        </Label>
        <Label title={'Relevans'}><DotTags list={ListName.RELEVANS} codes={behandling.relevansFor} linkCodelist/></Label>
      </Block>

      <Block marginTop={theme.sizing.scale2400}>
        <HeadingSmall marginBottom={theme.sizing.scale400}>Krav for behandling</HeadingSmall>
        <KravTable behandling={behandling}/>
      </Block>
    </Block>
  )
}

const behandlingKravQuery = gql`
  query getKravByFilter ($behandlingId: String!) {
    krav(filter: {behandlingId: $behandlingId}) {
      id
      navn
      kravNummer
      kravVersjon
      etterlevelser {
        id
        etterleves
        fristForFerdigstillelse
        status
        behandling {
          nummer
        }
      }
    }
  }`;

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
  const [kravFilter, setKravFilter] = useState({})
  useEffect(() => setKravFilter(filterForBehandling(props.behandling)), [props.behandling])
  const [rawData, loading] = useKravFilter(kravFilter, behandlingKravQuery.loc?.source.body)
  const [data, setData] = useState<KravTableData[]>([])

  useEffect(() => {
    const mapped = rawData.map(krav => {
      let etterlevelse = krav.etterlevelser.find(e => e.behandling.nummer === props.behandling.nummer)
      return ({
        kravNummer: krav.kravNummer,
        kravVersjon: krav.kravVersjon,
        navn: krav.navn,
        ...mapEtterlevelseData(etterlevelse)
      })
    })
    setData(mapped.filter(k => k.etterlevelseId || !mapped.find(k2 => k2.kravNummer === k.kravNummer && k2.kravVersjon > k.kravVersjon)))
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
    setData(data.map(e => e.kravVersjon === etterlevelse.kravVersjon && e.kravNummer == etterlevelse.kravNummer ? {...e, ...mapEtterlevelseData(etterlevelse)} : e))
  }

  return (
    loading ?
      <Spinner size={theme.sizing.scale2400}/> :
      <>
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
                    <Button tooltip='Vis etterlevelse' size='compact' kind='tertiary' onClick={() => setViewEtterlevelse(krav.etterlevelseId)}><FontAwesomeIcon icon={faEye}/></Button>}

                    {krav.etterlevelseId && <Button tooltip='Rediger' size='compact' kind='tertiary' onClick={() => setEdit(krav.etterlevelseId)}><FontAwesomeIcon icon={faEdit}/></Button>}
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
          <ModalHeader>{edit == 'ny' ? 'Ny' : 'Rediger'} etterlevelse</ModalHeader>
          <ModalBody>
            <EditModal etterlevelseId={edit} behandlingId={props.behandling.id} kravId={kravId} close={e => {
              setEdit(undefined)
              e && update(e)
            }}/>
          </ModalBody>
        </Modal>
        }
      </>
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
      {etterlevelse && <KravView krav={toKravId(etterlevelse)}/>}
      <EditEtterlevelse
        etterlevelse={etterlevelse}
        lockBehandlingAndKrav
        close={e => {
          props.close(e)
        }}/>
    </Block>
  )
}

const KravView = (props: {krav: KravId}) => {
  const [krav] = useKrav(props.krav, true)
  const [view, setView] = useState(false)

  return (
    <Block>
      <Block display='flex' justifyContent='space-between' alignItems='center'>
        {krav && <HeadingSmall>Krav: {kravName(krav)}</HeadingSmall>}
        <Block>
          <Button type='button' size='compact' onClick={() => setView(!view)}>{`${(view ? 'Skjul' : 'Vis mer')}`}</Button>
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
