import { Box, Button, Heading, TextField } from '@navikt/ds-react'
import axios from 'axios'
import { useState } from 'react'
import { deleteEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { PageLayout } from '../components/scaffold/Page'
import { env } from '../util/env'
import { UpdateMessage } from './EtterlevelseAdminPage'

export const EtterlevelseDokumentasjonAdminPage = () => {
  const [etterlevelseDokumentasjonId, setEtterlevelseDokumentasjonId] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')
  const [idValue, setIDvalue] = useState<string>('')
  const [sakValue, setSakvalue] = useState<string>('')

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

        <div className='pt-10'>
          Testing p360 intergation
          <Button
            onClick={() => {
              axios.post(`${env.backendBaseUrl}/p360/getCases`, { title: 'E101' })
            }}
          >
            search for e101 / ping
          </Button>
          <div className='flex my-5 gap-2'>
            <TextField
              label='etterlevelseDok id'
              onChange={(event) => setIDvalue(event.target.value)}
              value={idValue}
            />
            <Button
              onClick={() => {
                axios.post(
                  `${env.backendBaseUrl}/p360/createCases/etterlevelseDokumentasjon/${idValue}`
                )
              }}
            >
              lage sak
            </Button>
          </div>
          <div className='flex my-5 gap-2'>
            <TextField
              label='etterlevelseDok id'
              onChange={(event) => setIDvalue(event.target.value)}
              value={idValue}
            />
            <TextField
              label='Saksnummer'
              onChange={(event) => setSakvalue(event.target.value)}
              value={sakValue}
            />
            <Button
              onClick={() => {
                axios.post(
                  `${env.backendBaseUrl}/p360/create/documentCases/etterlevelseDokumentasjon/${idValue}`,
                  { caseNumber: sakValue }
                )
              }}
            >
              Lage dokument på saksnummer
            </Button>
          </div>
        </div>
      </div>
      <UpdateMessage message={updateMessage} />
    </PageLayout>
  )
}
export default EtterlevelseDokumentasjonAdminPage
