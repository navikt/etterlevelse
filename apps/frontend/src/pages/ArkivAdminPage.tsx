import {
  BodyShort,
  Button,
  Heading,
  Link,
  Pagination,
  Select,
  SortState,
  Spacer,
  Table,
  TextField,
} from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import {
  arkiveringMapToFormVal,
  arkiveringStatusToString,
  deleteEtterlevelseArkiv,
  getAllArkivering,
  getEtterlevelseArkiv,
  updateAsAdminEtterlevelseArkiv,
} from '../api/ArkiveringApi'
import { PageLayout } from '../components/scaffold/Page'
import { EEtterlevelseArkivStatus, IEtterlevelseArkiv } from '../constants'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { handleSort } from '../util/handleTableSort'
import { UpdateMessage } from './EtterlevelseAdminPage'

export const ArkivAdminPage = () => {
  const [arkiveringId, setArkiveringId] = useState<string>('')
  const [updateMessage, setUpdateMessage] = useState<string>('')
  const [deleteArkiveringId, setDeleteArkiveringId] = useState<string>('')
  const [deleteMessage, setDeleteMessage] = useState<string>('')
  const [arkiveringsStatus, setArkiveringsStatus] = useState<EEtterlevelseArkivStatus>()
  const [reloadTable, setReloadTable] = useState(false)
  const [tableContent, setTableContent] = useState<IEtterlevelseArkiv[]>([])

  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sort, setSort] = useState<SortState>()

  let sortedData = tableContent

  const comparator = (a: IEtterlevelseArkiv, b: IEtterlevelseArkiv, orderBy: string) => {
    switch (orderBy) {
      case 'status':
        return (a.status || '').localeCompare(b.status || '')
      case 'tilArkiveringDato':
        return (a.tilArkiveringDato || '').localeCompare(b.tilArkiveringDato || '')
      case 'arkiveringDato':
        return (a.arkiveringDato || '').localeCompare(b.arkiveringDato || '')
      default:
        return 0
    }
  }

  sortedData = sortedData
    .sort((a, b) => {
      if (sort) {
        return sort.direction === 'ascending'
          ? comparator(b, a, sort.orderBy)
          : comparator(a, b, sort.orderBy)
      }
      return 1
    })
    .slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const options = [
    { label: 'Ikke arkiver', value: EEtterlevelseArkivStatus.IKKE_ARKIVER },
    { label: 'Error', value: EEtterlevelseArkivStatus.ERROR },
    { label: 'Arkivert', value: EEtterlevelseArkivStatus.ARKIVERT },
    { label: 'Behandler arkivering', value: EEtterlevelseArkivStatus.BEHANDLER_ARKIVERING },
    { label: 'Til arkivering', value: EEtterlevelseArkivStatus.TIL_ARKIVERING },
  ]

  useEffect(() => {
    ;(async () => {
      const arkivering = await getAllArkivering()
      const mappedArkivering = arkivering.map((arkivering) => arkiveringMapToFormVal(arkivering))
      setTableContent(mappedArkivering)
      ampli.logEvent('sidevisning', {
        side: 'Etterlevelse arkivering admin side',
        sidetittel: 'Administrere arkivering',
        ...userRoleEventProp,
      })
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      const arkivering = await getAllArkivering()
      const mappedArkivering = arkivering.map((arkivering) => arkiveringMapToFormVal(arkivering))
      setTableContent(mappedArkivering)
    })()
  }, [reloadTable])

  return (
    <PageLayout pageTitle="Administrere Arkivering" currentPage="Administrere Arkivering">
      <div>
        <Heading size="medium" level="1">
          Administrere Arkivering
        </Heading>
      </div>

      <div className="flex items-end">
        <TextField
          label="Oppdatere arkivering status"
          placeholder="Arkiverings UID"
          value={arkiveringId}
          onChange={(e) => setArkiveringId(e.target.value)}
          className="flex-1 mr-3"
        />
        <Select
          label="Velg status"
          className="flex-1 mr-3"
          value={arkiveringsStatus}
          onChange={(e) => setArkiveringsStatus(e.target.value as EEtterlevelseArkivStatus)}
        >
          {options.map((option, index) => {
            ;<option value="">Velg status</option>
            return (
              <option key={index + '_' + option.label} value={option.value}>
                {option.label}
              </option>
            )
          })}
        </Select>
        <Button
          disabled={!arkiveringsStatus || !arkiveringId}
          onClick={() => {
            getEtterlevelseArkiv(arkiveringId).then((arkivering) => {
              if (arkiveringsStatus) {
                updateAsAdminEtterlevelseArkiv({
                  ...arkivering,
                  status: arkiveringsStatus,
                })
                  .then(() => {
                    setArkiveringId('')
                    setArkiveringsStatus(EEtterlevelseArkivStatus.IKKE_ARKIVER)
                    setReloadTable(!reloadTable)
                    setUpdateMessage(
                      'Oppdatering vellykket for arkivering med uid: ' + arkiveringId
                    )
                  })
                  .catch((e) => {
                    setUpdateMessage('Oppdatering mislykket, error: ' + e)
                  })
              }
            })
          }}
        >
          Oppdater Status
        </Button>
      </div>
      <UpdateMessage message={updateMessage} />

      <div className="flex items-end mt-8">
        <TextField
          label="Slett arkivering"
          placeholder="Arkiverings UID"
          onChange={(e) => setDeleteArkiveringId(e.target.value)}
          className="w-full mr-3"
        />
        <Button
          disabled={!deleteArkiveringId}
          onClick={() => {
            deleteEtterlevelseArkiv(deleteArkiveringId)
              .then(() => {
                setArkiveringId('')
                setReloadTable(!reloadTable)
                setDeleteMessage('Sletting vellykket for arkivering med uid: ' + deleteArkiveringId)
              })
              .catch((e) => {
                setDeleteMessage('Sletting mislykket, error: ' + e)
              })
          }}
        >
          Slett
        </Button>
      </div>
      <UpdateMessage message={deleteMessage} />

      <div className="mt-8 w-full">
        <Heading level="2" size="small">
          Arkiv tabell
        </Heading>
        {tableContent.length && (
          <div>
            <Table
              size="large"
              zebraStripes
              sort={sort}
              onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
            >
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Arkivering UID</Table.ColumnHeader>
                  <Table.ColumnHeader>Etterlevelse Dokumentasjon ID</Table.ColumnHeader>
                  <Table.ColumnHeader sortKey="status" sortable>
                    Status
                  </Table.ColumnHeader>
                  <Table.ColumnHeader sortKey="tilArkiveringDato" sortable>
                    Bestilt Arkiverings dato
                  </Table.ColumnHeader>
                  <Table.ColumnHeader sortKey="arkiveringDato" sortable>
                    Arkiverings dato
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedData.map((arkivering: IEtterlevelseArkiv) => {
                  return (
                    <Table.Row key={arkivering.id}>
                      <Table.HeaderCell scope="row">{arkivering.id}</Table.HeaderCell>
                      <Table.DataCell>
                        <Link href={`/dokumentasjon/${arkivering.etterlevelseDokumentasjonId}`}>
                          {arkivering.etterlevelseDokumentasjonId}
                        </Link>
                      </Table.DataCell>
                      <Table.DataCell>{arkiveringStatusToString(arkivering.status)}</Table.DataCell>
                      <Table.DataCell>
                        {' '}
                        {moment(arkivering.tilArkiveringDato).format('lll')}
                      </Table.DataCell>
                      <Table.DataCell>
                        {moment(arkivering.arkiveringDato).format('lll')}
                      </Table.DataCell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
            <div className="flex w-full justify-center items-center mt-3">
              <Select
                label="Antall rader:"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                size="small"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
              <Spacer />
              <div>
                <Pagination
                  page={page}
                  onPageChange={setPage}
                  count={Math.ceil(tableContent.length / rowsPerPage)}
                  prevNextTexts
                  size="small"
                />
              </div>
              <Spacer />
              <BodyShort>Totalt antall rader: {tableContent.length}</BodyShort>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
export default ArkivAdminPage
