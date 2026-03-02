'use client'

import {
  deleteEtterlevelseDokumentasjon,
  getEtterlevelseDokumentasjon,
  updateEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { Box, Button, Heading, TextField } from '@navikt/ds-react'
import { useState } from 'react'
import { UpdateMessage } from '../common/commonComponents'

export const EtterlevelseDokumentasjonAdminPage = () => {
  const [etterlevelseDokumentasjonId, setEtterlevelseDokumentasjonId] = useState('')
  const [etterlevelseDokumentasjonREVERTId, setEtterlevelseDokumentasjonREVERTId] = useState('')
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
        <Box className='mb-2.5' padding='space-4' background='warning-soft'>
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
      </div>

      <div className='flex items-end my-5'>
        <TextField
          label='revert versjon etterlevelse dokumentasjon med uid'
          placeholder='Etterlevelse dokumentasjon UID'
          onChange={(e) => setEtterlevelseDokumentasjonREVERTId(e.target.value)}
          className='w-full mr-3'
        />
        <Button
          type='button'
          onClick={async () => {
            await getEtterlevelseDokumentasjon(etterlevelseDokumentasjonREVERTId).then(
              async (response) => {
                const versjonHistorikk = response.versjonHistorikk.filter(
                  (historikk) => historikk.versjon === 1
                )
                await updateEtterlevelseDokumentasjon({
                  ...response,
                  etterlevelseDokumentVersjon: 1,
                  versjonHistorikk: versjonHistorikk,
                })
              }
            )
          }}
        >
          Revert Versjon
        </Button>
      </div>
      <UpdateMessage message={updateMessage} />
    </PageLayout>
  )
}
export default EtterlevelseDokumentasjonAdminPage
