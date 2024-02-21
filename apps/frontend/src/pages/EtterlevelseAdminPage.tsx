import { BodyShort, Button, Heading, TextField } from '@navikt/ds-react'
import { useState } from 'react'
import { deleteEtterlevelse } from '../api/EtterlevelseApi'
import { PageLayout } from '../components/scaffold/Page'

export const EtterlevelseAdminPage = () => {
  const [updateMessage, setUpdateMessage] = useState<string>('')
  const [etterlevelseId, setEtterlevelseId] = useState<string>('')

  return (
    <PageLayout pageTitle="Administrere Etterlevelse" currentPage="Administrere Etterlevelse">
      <Heading size="medium" level="1">
        Administrere Etterlevelse
      </Heading>

      <div className="mt-5">
        <div className="flex items-end">
          <TextField
            label="Slette etterlevelse ved uid"
            placeholder="Etterlevelse UID"
            onChange={(e) => setEtterlevelseId(e.target.value)}
            className="w-full mr-3"
          />
          <Button
            disabled={!etterlevelseId}
            variant="secondary"
            onClick={() => {
              setUpdateMessage('')
              deleteEtterlevelse(etterlevelseId)
                .then(() => {
                  setUpdateMessage(
                    'Sletting vellykket for etterlevelses med uid: ' + etterlevelseId
                  )
                  setEtterlevelseId('')
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

export const UpdateMessage = ({ message }: { message?: string }) => {
  return (
    <div>
      {message ? (
        <div>
          {message.match('error') ? (
            <BodyShort className="text-nav-red">{message}</BodyShort>
          ) : (
            <BodyShort>{message}</BodyShort>
          )}
        </div>
      ) : (
        <div />
      )}
    </div>
  )
}
export default EtterlevelseAdminPage
