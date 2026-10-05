'use client'

import {
  BodyShort,
  Button,
  Heading,
  Link,
  Pagination,
  Search,
  Select,
  SortState,
  Spacer,
  Table,
  TextField,
  Textarea,
} from '@navikt/ds-react'
import { useEffect, useMemo, useState } from 'react'
import { deletePvkDokument, getAllPvkDokumentListItem } from '@/api/pvkDokument/pvkDokumentApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IPvkDokumentListItem } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { pvkDokumentasjonPvkBehovUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { handleSort } from '@/util/handleTableSort'
import { UpdateMessage } from '../common/commonComponents'
import EditPvkDokumentAdmin from './EditPvkDokumentAdmin'

const PvkDokumentAdminPage = () => {
  const [deleteMessage, setDeleteMessage] = useState<string>('')
  const [deletePvkDokumentId, setDeletePvkDokumentId] = useState<string>('')
  const [reloadTable, setReloadTable] = useState(false)

  const [tableContent, setTableContent] = useState<IPvkDokumentListItem[]>([])
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false)

  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sort, setSort] = useState<SortState>()
  const [isError, setIsError] = useState<boolean>(false)
  const [deleteComment, setDeleteComment] = useState<string>('')
  const [selectedPvkDokuement, setSelectedPvkDokument] = useState<string>('')
  const [selectedEtterlevelsesDokument, setSelectedEtterlevelsesDokument] = useState<string>('')
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [searchFilter, setSearchFilter] = useState<string>('')

  const filteredTableContent = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage
    return tableContent
      .filter((content) =>
        `E${content.etterlevelseNummer}.${content.currentEtterlevelseDokumentVersjon}`.includes(
          searchFilter
        )
      )
      .slice(startIndex, startIndex + rowsPerPage)
  }, [page, rowsPerPage, tableContent, searchFilter])

  const loadData = async () => {
    setIsTableLoading(true)

    await getAllPvkDokumentListItem().then((response) => {
      setTableContent(response)
      setIsTableLoading(false)
    })
  }

  useEffect(() => {
    ;(async () => {
      loadData()
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (reloadTable) {
        loadData()
      }
    })()
  }, [reloadTable])

  return (
    <PageLayout pageTitle='Administrer Pvk Dokument' currentPage='Administrer Pvk Dokument'>
      <div>
        <Heading size='medium' level='1'>
          Administrer Pvk Dokument
        </Heading>
      </div>

      <div className='flex items-start mt-8'>
        <div className='w-full mr-3'>
          <TextField
            label='Slett pvk dokument'
            placeholder='Pvk Dokument UID'
            onChange={(e) => setDeletePvkDokumentId(e.target.value)}
            className='w-full mr-3'
          />

          <Textarea
            label='Begrunnelse for sletting (påkrevd)'
            onChange={(e) => setDeleteComment(e.target.value)}
            className='w-full mt-3'
          />
        </div>

        <Button
          className='mt-8'
          disabled={!deletePvkDokumentId || deleteComment === ''}
          onClick={async () => {
            deletePvkDokument(deletePvkDokumentId, deleteComment)
              .then(() => {
                setIsError(false)
                setDeletePvkDokumentId('')
                setReloadTable(!reloadTable)
                setDeleteMessage(
                  'Sletting vellykket for Pvk dokument med uid: ' + deletePvkDokumentId
                )
              })
              .catch((e) => {
                setIsError(true)
                setDeleteMessage(
                  `Sletting mislykket, error: ${e.status}, ${e.response?.data.message}`
                )
              })
          }}
        >
          Slett
        </Button>
      </div>

      <UpdateMessage message={deleteMessage} isError={isError} />

      <div className='mt-8 w-full'>
        <Heading level='2' size='small'>
          Pvk Dokument tabell
        </Heading>

        <search>
          <Search
            label='Søk med etterlevlesesnummer'
            variant='simple'
            onChange={(value) => setSearchFilter(value)}
          />
        </search>

        {isTableLoading && <CenteredLoader />}
        {filteredTableContent.length !== 0 && !isTableLoading && (
          <div>
            <Table
              size='large'
              zebraStripes
              sort={sort}
              onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
            >
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Pvk dokument ID</Table.ColumnHeader>
                  <Table.ColumnHeader>Etterlevelse dokumentasjon ID</Table.ColumnHeader>
                  <Table.ColumnHeader>Etterlevelse nummer</Table.ColumnHeader>
                  <Table.ColumnHeader>Action</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredTableContent.map((pvkDokument: IPvkDokumentListItem) => (
                  <Table.Row key={pvkDokument.id}>
                    <Table.HeaderCell scope='row'>
                      <Link
                        href={pvkDokumentasjonPvkBehovUrl(
                          pvkDokument.etterlevelseDokumentId,
                          pvkDokument.id
                        )}
                      >
                        {pvkDokument.id}
                      </Link>
                    </Table.HeaderCell>
                    <Table.DataCell>
                      <Link
                        href={etterlevelseDokumentasjonIdUrl(pvkDokument.etterlevelseDokumentId)}
                      >
                        {pvkDokument.etterlevelseDokumentId}
                      </Link>
                    </Table.DataCell>
                    <Table.DataCell>
                      {' '}
                      E{pvkDokument.etterlevelseNummer}.
                      {pvkDokument.currentEtterlevelseDokumentVersjon}
                    </Table.DataCell>
                    <Table.DataCell>
                      <Button
                        as='button'
                        onClick={() => {
                          setSelectedPvkDokument(pvkDokument.id)
                          setSelectedEtterlevelsesDokument(
                            `E${pvkDokument.etterlevelseNummer}.${pvkDokument.currentEtterlevelseDokumentVersjon}`
                          )
                          setIsEditModalOpen(true)
                        }}
                      >
                        Rediger
                      </Button>
                    </Table.DataCell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            <div className='flex w-full justify-center items-center mt-3'>
              <Select
                label='Antall rader:'
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                size='small'
              >
                <option value='5'>5</option>
                <option value='10'>10</option>
                <option value='20'>20</option>
                <option value='50'>50</option>
                <option value='100'>100</option>
              </Select>
              <Spacer />
              <div>
                <Pagination
                  page={page}
                  onPageChange={setPage}
                  count={Math.ceil(tableContent.length / rowsPerPage)}
                  prevNextTexts
                  size='small'
                />
              </div>
              <Spacer />
              <BodyShort>Totalt antall rader: {tableContent.length}</BodyShort>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedPvkDokuement !== '' && (
          <EditPvkDokumentAdmin
            isOpen={isEditModalOpen}
            setIsOpen={setIsEditModalOpen}
            selectedPvkDokument={selectedPvkDokuement}
            setSelectedPvkDokument={setSelectedPvkDokument}
            selectedEtterlevelsesDokument={selectedEtterlevelsesDokument}
            setSelectedEtterlevelsesDokument={setSelectedEtterlevelsesDokument}
          />
        )}
      </div>
    </PageLayout>
  )
}

export default PvkDokumentAdminPage
