import { EEtterlevelseStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { etterlevelseDokumentasjonTemaUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { getEtterlevelseStatus } from '@/util/etterlevelseUtil/etterlevelseUtil'
import { getNextKravUrl } from '@/util/krav/kravUtil'
import { BodyShort, Button, Link, Modal } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  isNavigationModalOpen: boolean
  isTabAlertActive: boolean
  setIsNavigationModalOpen: (state: boolean) => void
  statusText: string
  hasNextKrav: boolean
  nextKravToDocument: string
  etterlevelseDokumentasjonId?: string
  temaCode?: string
}

export const ChangesSavedEttelevelseModal: FunctionComponent<TProps> = ({
  isNavigationModalOpen,
  isTabAlertActive,
  setIsNavigationModalOpen,
  statusText,
  hasNextKrav,
  nextKravToDocument,
  etterlevelseDokumentasjonId,
  temaCode,
}) => {
  return (
    <Modal
      open={isNavigationModalOpen && !isTabAlertActive}
      onClose={() => setIsNavigationModalOpen(false)}
      header={{ heading: 'Endringene er lagret' }}
    >
      <Modal.Body>
        <BodyShort>
          Status er satt til: {getEtterlevelseStatus(statusText as EEtterlevelseStatus)}
        </BodyShort>
      </Modal.Body>
      <Modal.Footer>
        <div className='w-full flex flex-col gap-2'>
          <BodyShort>Hvor ønsker du å gå?</BodyShort>
          {hasNextKrav && (
            <Link
              href={getNextKravUrl(nextKravToDocument)}
              onClick={() => {
                // ampli.logEvent('knapp klikket', {
                //   tekst: 'Til nest krav som ikke er ferdig utfylt i dette temaet',
                //   pagePath: location.pathname,
                //   ...userRoleEventProp,
                // })
              }}
            >
              <Button variant='secondary'>
                Til neste krav som ikke er ferdig utfylt i dette temaet
              </Button>
            </Link>
          )}
          <Button
            onClick={() => {
              setIsNavigationModalOpen(false)
              window.location.reload()
            }}
            variant='secondary'
          >
            Fortsett å redigere dokumentet
          </Button>

          <Link
            href={etterlevelseDokumentasjonTemaUrl(etterlevelseDokumentasjonId, temaCode)}
            className='flex w-full'
            onClick={() => {
              // ampli.logEvent('knapp klikket', {
              //   tekst: 'Til temaoversikten',
              //   pagePath: location.pathname,
              //   ...userRoleEventProp,
              // })
            }}
          >
            <Button className='flex w-full' variant='secondary'>
              Til temaoversikten
            </Button>
          </Link>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
export default ChangesSavedEttelevelseModal
