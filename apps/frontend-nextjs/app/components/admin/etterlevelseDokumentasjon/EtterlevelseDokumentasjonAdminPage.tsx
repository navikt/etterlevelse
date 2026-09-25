'use client'

import { Button, Heading, InfoCard, List, TextField, Textarea } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { deleteEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { UpdateMessage } from '../common/commonComponents'

const EtterlevelseDokumentasjonAdminPage = () => {
  const [etterlevelseDokumentasjonId, setEtterlevelseDokumentasjonId] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')
  const [isError, setIsError] = useState<boolean>(false)
  const [deleteComment, setDeleteComment] = useState<string>('')

  return (
    <PageLayout
      pageTitle='dministrere Etterlevelse Dokumentasjon'
      currentPage='Administrere Etterlevelse Dokumentasjon'
    >
      <Heading size='medium' level='1'>
        Administrere Etterlevelse Dokumentasjon
      </Heading>

      <div className='mt-5 w-full'>
        <InfoCard data-color='info' className='my-4 '>
          <InfoCard.Header>
            <InfoCard.Title>Infomarsjon om sletting av Etterlevelses dokument</InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            Når et etterlevelses dokument blir slettet vil alle dataene koblet til den også bli
            slettet. Disse dataene er:
            <List as='ul' className='mb-2'>
              <List.Item>alle etterlevelser knyttet til dokumentet</List.Item>
              <List.Item>alle etterlevelses metadataer</List.Item>
              <List.Item>behandlingens art og omfang data</List.Item>
              <List.Item>behandlingenslivsløp data</List.Item>
              <List.Item>pvk dokumentet</List.Item>
              <List.Item>Risikoscenario og tiltak koblett til pvk dokumentet</List.Item>
            </List>
            OBS! Sjekk om dokumentet har et arktiv relasjon før du sletter, sletting vil feile
            dersom det finnes relasjon
          </InfoCard.Content>
        </InfoCard>

        <div className='flex items-start'>
          <div className='w-full mr-3'>
            <TextField
              label='Slett etterlevelse dokumentasjon med uid'
              placeholder='Etterlevelse dokumentasjon UID'
              onChange={(e) => setEtterlevelseDokumentasjonId(e.target.value)}
              className='w-full'
            />

            <Textarea
              label='Begrunnelse for sletting  (påkrevd)'
              onChange={(e) => setDeleteComment(e.target.value)}
              className='w-full mt-3'
            />
          </div>

          <Button
            className='mt-8'
            disabled={!etterlevelseDokumentasjonId || deleteComment === ''}
            variant='secondary'
            onClick={() => {
              setUpdateMessage('')
              deleteEtterlevelseDokumentasjon(etterlevelseDokumentasjonId, deleteComment)
                .then(() => {
                  setIsError(false)
                  setUpdateMessage(
                    'Sletting vellykket for etterlevelses med uid: ' + etterlevelseDokumentasjonId
                  )
                  setEtterlevelseDokumentasjonId('')
                })
                .catch((e: AxiosError<{ message?: string }>) => {
                  setIsError(true)
                  setUpdateMessage(
                    `Sletting mislykket, error: ${e.status}, ${e.response?.data.message}`
                  )
                })
            }}
          >
            Slett
          </Button>
        </div>
      </div>
      <UpdateMessage message={updateMessage} isError={isError} />
    </PageLayout>
  )
}
export default EtterlevelseDokumentasjonAdminPage
