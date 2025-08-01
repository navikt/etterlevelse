'use client'

import { deleteEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { PageLayout } from '@/components/others/scaffold/page'
import { env } from '@/util/env/env'
import { Box, Button, Heading, TextField } from '@navikt/ds-react'
import axios from 'axios'
import { useState } from 'react'
import { UpdateMessage } from '../common/commonComponents'

export const EtterlevelseDokumentasjonAdminPage = () => {
  const [etterlevelseDokumentasjonId, setEtterlevelseDokumentasjonId] = useState('')
  const [etterlevelseDokumentasjonIdArkiv, setEtterlevelseDokumentasjonIdArkiv] = useState('')
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

        <div className='flex items-end pt-10'>
          <TextField
            label='Arkiver etterlevelse dokumentasjon med uid'
            placeholder='Etterlevelse dokumentasjon UID'
            onChange={(e) => setEtterlevelseDokumentasjonIdArkiv(e.target.value)}
            className='w-full mr-3'
          />
          <Button
            disabled={!etterlevelseDokumentasjonIdArkiv}
            variant='secondary'
            onClick={async () => {
              setUpdateMessage('')
              await axios
                .post<any>(
                  `${env.backendBaseUrl}/p360/arkiver?etterlevelseDokumentasjonId=${etterlevelseDokumentasjonIdArkiv}&onlyActiveKrav=true`
                )
                .then((response) => {
                  setUpdateMessage(
                    'Arkivering vellykket for etterlevelses med uid: ' + etterlevelseDokumentasjonId
                  )

                  console.debug(response)
                  setEtterlevelseDokumentasjonIdArkiv('')
                })
                .catch((e) => {
                  setUpdateMessage('Sletting mislykket, error: ' + e)
                })
            }}
          >
            Arkiver
          </Button>
        </div>
      </div>
      <UpdateMessage message={updateMessage} />
    </PageLayout>
  )
}
export default EtterlevelseDokumentasjonAdminPage
