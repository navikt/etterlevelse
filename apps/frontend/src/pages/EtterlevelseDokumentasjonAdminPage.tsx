import { Helmet } from 'react-helmet'
import { deleteEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { useState } from 'react'
import { UpdateMessage } from './EtterlevelseAdminPage'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { Button, Heading, TextField } from '@navikt/ds-react'
import { PageLayout } from '../components/scaffold/Page'

export const EtterlevelseDokumentasjonAdminPage = () => {
  const [etterlevelseDokumentasjonId, setEtterlevelseDokumentasjonId] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')

  return (
    <PageLayout pageTitle="dministrere Etterlevelse Dokumentasjon" currentPage="Administrere Etterlevelse Dokumentasjon">
      <Heading size="medium" level="1">
        Administrere Etterlevelse Dokumentasjon
      </Heading>

      <div className="mt-5">
        <div className="flex items-end">
          <TextField
            label="Slett etterlevelse dokumentasjon med uid"
            placeholder="Etterlevelse dokumentasjon UID"
            onChange={(e) => setEtterlevelseDokumentasjonId(e.target.value)}
            className="w-full mr-3"
          />
          <Button
            disabled={!etterlevelseDokumentasjonId}
            variant="secondary"
            onClick={() => {
              setUpdateMessage('')
              deleteEtterlevelseDokumentasjon(etterlevelseDokumentasjonId)
                .then(() => {
                  setUpdateMessage('Sletting vellykket for etterlevelses med uid: ' + etterlevelseDokumentasjonId)
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
      <UpdateMessage message={updateMessage} />
    </PageLayout>
  )
}
export default EtterlevelseDokumentasjonAdminPage
