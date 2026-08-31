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
import { Alert, BodyShort, Button, Heading, Loader, Table, Tag } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'

const GjenopprettDokumentasjonAdminPage = () => {
  const [deletedDokumenter, setDeletedDokumenter] = useState<IDeletedEtterlevelseDokumentasjon[]>(
    []
  )
  const [loading, setLoading] = useState<boolean>(true)
  const [restoringId, setRestoringId] = useState<string>('')
  const [result, setResult] = useState<IRestoreResult>()
  const [error, setError] = useState<string>('')

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
            {deletedDokumenter.map((dokument) => (
              <Table.Row key={dokument.id}>
                <Table.HeaderCell scope='row'>
                  E{dokument.etterlevelseNummer}.{dokument.etterlevelseDokumentVersjon}
                </Table.HeaderCell>
                <Table.DataCell>{dokument.title}</Table.DataCell>
                <Table.DataCell>{moment(dokument.deletedTime).format('LLL')}</Table.DataCell>
                <Table.DataCell>{dokument.deletedBy}</Table.DataCell>
                <Table.DataCell>
                  {dokument.hadPvk && (
                    <Tag variant='warning' size='small'>
                      Hadde PVK
                    </Tag>
                  )}
                </Table.DataCell>
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
      )}
    </PageLayout>
  )
}

export default GjenopprettDokumentasjonAdminPage
