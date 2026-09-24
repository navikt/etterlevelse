'use client'

import { Button, Heading, TextField } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { deleteEtterlevelse } from '@/api/etterlevelse/etterlevelseApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { UpdateMessage } from '../common/commonComponents'

export const EtterlevelseAdminPage = () => {
  const [updateMessage, setUpdateMessage] = useState<string>('')
  const [etterlevelseId, setEtterlevelseId] = useState<string>('')
  const [isError, setIsError] = useState<boolean>(false)

  return (
    <PageLayout pageTitle='Administrere Etterlevelse' currentPage='Administrere Etterlevelse'>
      <Heading size='medium' level='1'>
        Administrere Etterlevelse
      </Heading>

      <div className='mt-5'>
        <div className='flex items-end'>
          <TextField
            label='Slette etterlevelse ved uid'
            placeholder='Etterlevelse UID'
            onChange={(e) => setEtterlevelseId(e.target.value)}
            className='w-full mr-3'
          />
          <Button
            disabled={!etterlevelseId}
            variant='secondary'
            onClick={() => {
              setUpdateMessage('')
              deleteEtterlevelse(etterlevelseId)
                .then(() => {
                  setIsError(false)
                  setUpdateMessage(
                    'Sletting vellykket for etterlevelses med uid: ' + etterlevelseId
                  )
                  setEtterlevelseId('')
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
