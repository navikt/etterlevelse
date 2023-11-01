import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { deleteEtterlevelse } from '../api/EtterlevelseApi'
import { BodyShort, Button, Heading, TextField } from '@navikt/ds-react'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'

export const EtterlevelseAdminPage = () => {
  const [updateMessage, setUpdateMessage] = useState<string>('')
  const [etterlevelseId, setEtterlevelseId] = useState<string>('')

  return (
    <div className="w-full" id="content" role="main">
      <div className="w-full flex justify-center items-center flex-col mt-6">
        <div className="w-full max-w-7xl px-8">
          <div className="flex-1 justify-start flex">
            <CustomizedBreadcrumbs currentPage="Administrere Etterlevelse" />
          </div>
          <div>
            <Helmet>
              <meta charSet="utf-8" />
              <title>Administrere Etterlevelse</title>
            </Helmet>
            <Heading size="medium">Administrere Etterlevelse</Heading>
          </div>

          <div className="mt-5">
            <div className="flex items-end">
              <TextField
                label="Slette etterlevelses dokumentasjon ved uid"
                placeholder='Etterlevelse UID'
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
                      setUpdateMessage('Sletting vellykket for etterlevelses med uid: ' + etterlevelseId)
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
        </div>
      </div>
    </div>
  )
}

export const UpdateMessage = ({ message }: { message?: string }) => {
  return (
    <div>
      {message ? (
        <div>
          {message.match('error') ? (
            <BodyShort className="text-nav-red">
              {message}
            </BodyShort>
          ) : (
            <BodyShort>
              {message}
            </BodyShort>
          )}
        </div>
      ) : (
        <div />
      )}
    </div>
  )
}
export default EtterlevelseAdminPage
