'use client'

import {
  getDeletedEtterlevelseDokumentasjoner,
  restoreEtterlevelseDokumentasjon,
} from '@/api/restore/restoreApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import {
  IDeletedEtterlevelseDokumentasjon,
  IRestoreResult,
} from '@/constants/admin/restore/restoreConstants'
import {
  Alert,
  BodyShort,
  Button,
  Heading,
  Loader,
  Pagination,
  Search,
  Select,
  Spacer,
  Table,
} from '@navikt/ds-react'
import moment from 'moment'
import { ChangeEvent, useEffect, useState } from 'react'

const GjenopprettDokumentasjonAdminPage = () => {
  const [deletedDokumenter, setDeletedDokumenter] = useState<IDeletedEtterlevelseDokumentasjon[]>(
    []
  )
  const [loading, setLoading] = useState<boolean>(true)
  const [restoringId, setRestoringId] = useState<string>('')
  const [result, setResult] = useState<IRestoreResult>()
  const [error, setError] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(20)

  const fetchDeleted = (): void => {
    getDeletedEtterlevelseDokumentasjoner()
      .then((response) => {
        setDeletedDokumenter(response)
        setLoading(false)
      })
      .catch((e) => {
        setError('Kunne ikke hente slettede dokumenter: ' + e)
        setLoading(false)
      })
  }

  const load = (): void => {
    setLoading(true)
    fetchDeleted()
  }

  useEffect(fetchDeleted, [])

  const onRestore = (id: string): void => {
    setError('')
    setResult(undefined)
    setRestoringId(id)
    restoreEtterlevelseDokumentasjon(id)
      .then((response) => {
        setResult(response)
        setRestoringId('')
        load()
      })
      .catch((e) => {
        setError('Gjenoppretting mislykket: ' + e)
        setRestoringId('')
      })
  }

  const filteredDokumenter: IDeletedEtterlevelseDokumentasjon[] = deletedDokumenter.filter(
    (dokument) => {
      if (!search) {
        return true
      }
      const query: string = search.toLowerCase()
      return (
        (dokument.title || '').toLowerCase().includes(query) ||
        `e${dokument.etterlevelseNummer}.${dokument.etterlevelseDokumentVersjon}`.includes(query) ||
        (dokument.deletedBy || '').toLowerCase().includes(query)
      )
    }
  )

  const pagedDokumenter: IDeletedEtterlevelseDokumentasjon[] = filteredDokumenter.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  )

  return (
    <PageLayout
      pageTitle='Gjenopprett slettede dokumenter'
      currentPage='Gjenopprett slettede dokumenter'
    >
      <Heading spacing size='medium' level='1'>
        Gjenopprett slettede dokumenter
      </Heading>

      <BodyShort className='mb-5'>
        Her kan du gjenopprette etterlevelsesdokumentasjoner som er slettet ved en feil. Dokumentet
        og tilhørende data gjenopprettes fra logg.
      </BodyShort>

      {result && (
        <Alert variant={result.warnings.length > 0 ? 'warning' : 'success'} className='mb-5'>
          <Heading size='xsmall' level='2' spacing>
            Gjenoppretting fullført
          </Heading>
          <BodyShort>Etterlevelser: {result.restoredEtterlevelser}</BodyShort>
          <BodyShort>Etterlevelse metadata: {result.restoredEtterlevelseMetadata}</BodyShort>
          <BodyShort>Behandlingens livsløp: {result.restoredBehandlingensLivslop}</BodyShort>
          <BodyShort>
            Behandlingens art og omfang: {result.restoredBehandlingensArtOgOmfang}
          </BodyShort>
          <BodyShort>PVK-dokument: {result.restoredPvkDokument}</BodyShort>
          <BodyShort>Risikoscenario: {result.restoredRisikoscenario}</BodyShort>
          <BodyShort>Tiltak: {result.restoredTiltak}</BodyShort>
          <BodyShort>PVO-tilbakemelding: {result.restoredPvoTilbakemelding}</BodyShort>
          {result.warnings.map((warning, index) => (
            <BodyShort key={index} className='mt-2'>
              {warning}
            </BodyShort>
          ))}
        </Alert>
      )}

      {error && (
        <Alert variant='error' className='mb-5'>
          {error}
        </Alert>
      )}

      {loading && <Loader size='large' />}

      {!loading && deletedDokumenter.length === 0 && (
        <BodyShort>Ingen slettede dokumenter funnet.</BodyShort>
      )}

      {!loading && deletedDokumenter.length > 0 && (
        <div className='w-full'>
          <div className='mb-5 max-w-2xl'>
            <Search
              label='Søk etter slettede dokumenter'
              size='medium'
              variant='simple'
              value={search}
              onChange={(value: string) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder='Søk på nummer, tittel eller slettet av'
            />
          </div>

          {filteredDokumenter.length === 0 && <BodyShort>Ingen treff på «{search}».</BodyShort>}

          {filteredDokumenter.length > 0 && (
            <>
              <Table size='medium' zebraStripes>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Nummer</Table.ColumnHeader>
                    <Table.ColumnHeader>Tittel</Table.ColumnHeader>
                    <Table.ColumnHeader>Slettet</Table.ColumnHeader>
                    <Table.ColumnHeader>Slettet av</Table.ColumnHeader>
                    <Table.ColumnHeader>PVK</Table.ColumnHeader>
                    <Table.ColumnHeader />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {pagedDokumenter.map((dokument) => (
                    <Table.Row key={dokument.id}>
                      <Table.HeaderCell scope='row'>
                        E{dokument.etterlevelseNummer}.{dokument.etterlevelseDokumentVersjon}
                      </Table.HeaderCell>
                      <Table.DataCell>{dokument.title}</Table.DataCell>
                      <Table.DataCell>{moment(dokument.deletedTime).format('LLL')}</Table.DataCell>
                      <Table.DataCell>{dokument.deletedBy}</Table.DataCell>
                      <Table.DataCell>{dokument.hadPvk ? 'Med PVK' : 'Uten PVK'}</Table.DataCell>
                      <Table.DataCell>
                        <Button
                          size='small'
                          variant='secondary'
                          loading={restoringId === dokument.id}
                          disabled={restoringId !== '' && restoringId !== dokument.id}
                          onClick={() => onRestore(dokument.id)}
                        >
                          Gjenopprett
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
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    setRowsPerPage(parseInt(event.target.value))
                    setPage(1)
                  }}
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
                    count={Math.ceil(filteredDokumenter.length / rowsPerPage)}
                    prevNextTexts
                    size='small'
                  />
                </div>
                <Spacer />
                <BodyShort>Totalt antall rader: {filteredDokumenter.length}</BodyShort>
              </div>
            </>
          )}
        </div>
      )}
    </PageLayout>
  )
}

export default GjenopprettDokumentasjonAdminPage
