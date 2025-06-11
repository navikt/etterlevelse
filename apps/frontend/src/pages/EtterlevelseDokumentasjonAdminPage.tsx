import { Box, Button, Heading, TextField } from '@navikt/ds-react'
import { useState } from 'react'
import { deleteEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { deleteEtterlevelseMetadata } from '../api/EtterlevelseMetadataApi'
import { PageLayout } from '../components/scaffold/Page'
import { UpdateMessage } from './EtterlevelseAdminPage'

export const EtterlevelseDokumentasjonAdminPage = () => {
  const [etterlevelseDokumentasjonId, setEtterlevelseDokumentasjonId] = useState('')
  const [etterlevelseMetadataId, setEtterlevelseMetadataId] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')

  return (
    <PageLayout
      pageTitle='dministrere Etterlevelse Dokumentasjon'
      currentPage='Administrere Etterlevelse Dokumentasjon'
    >
      <Heading size='medium' level='1'>
        Administrere Etterlevelse Dokumentasjon
      </Heading>

      <div className='mt-5 w-full'>
        <Box className='mb-2.5' padding='4' background='surface-warning-subtle'>
          OBS! Når et etterlevelses dokument blir slettet vil alle dataene( etterlevelser,
          etterlevelses metadataer, og etterlevelse arkiv) koblet til den også bli slettet.
        </Box>
        <div className='flex items-end'>
          <TextField
            label='Slett etterlevelse dokumentasjon med uid'
            placeholder='Etterlevelse dokumentasjon UID'
            onChange={(e) => setEtterlevelseDokumentasjonId(e.target.value)}
            className='w-full mr-3'
          />
          <Button
            disabled={!etterlevelseDokumentasjonId}
            variant='secondary'
            onClick={() => {
              setUpdateMessage('')
              deleteEtterlevelseDokumentasjon(etterlevelseDokumentasjonId)
                .then(() => {
                  setUpdateMessage(
                    'Sletting vellykket for etterlevelses med uid: ' + etterlevelseDokumentasjonId
                  )
                  setEtterlevelseDokumentasjonId('')
                })
                .catch((e) => {
                  setUpdateMessage('Sletting mislykket, error: ' + e)
                })
            }}
          >
            Slett
          </Button>
        </div>

        <div className='flex items-end pd-5'>
          <TextField
            label='Slett etterlevelse metadata med uid'
            placeholder='Etterlevelse metadata UID'
            onChange={(e) => setEtterlevelseMetadataId(e.target.value)}
            className='w-full mr-3'
          />
          <Button
            disabled={!etterlevelseMetadataId}
            variant='secondary'
            onClick={() => {
              setUpdateMessage('')
              deleteEtterlevelseMetadata(etterlevelseMetadataId)
                .then(() => {
                  setUpdateMessage(
                    'Sletting vellykket for etterlevelse metadata med uid: ' +
                      etterlevelseMetadataId
                  )
                  setEtterlevelseMetadataId('')
                })
                .catch((e) => {
                  setUpdateMessage('Sletting mislykket, error: ' + e)
                })
            }}
          >
            Slett
          </Button>
        </div>
      </div>
      <UpdateMessage message={updateMessage} />
    </PageLayout>
  )
}
export default EtterlevelseDokumentasjonAdminPage
