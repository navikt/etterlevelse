'use client'

import { arkiver } from '@/api/p360/p360Api'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { p360Url } from '@/routes/p360/p360Routes'
import { Alert, BodyLong, Button, Link, Loader, Modal, Radio, RadioGroup } from '@navikt/ds-react'
import { useState } from 'react'

type TArkiveringModalProps = {
  arkivModal: boolean
  setArkivModal: React.Dispatch<React.SetStateAction<boolean>>
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
}

export const ArkiveringModal = ({
  arkivModal,
  setArkivModal,
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
}: TArkiveringModalProps) => {
  const [onlyActiveKrav, setOnlyActiveKrav] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [successMessageOpen, setSuccessMessageOpen] = useState<boolean>(false)
  const [errorMessageOpen, setErrorMessageOpen] = useState<string | null>(null)
  return (
    <Modal
      open={arkivModal}
      onClose={() => {
        setArkivModal(false)
      }}
      aria-label='Arkiverings modal'
      header={{
        heading: 'Arkiver i Public 360',
        closeButton: false,
      }}
    >
      <Modal.Body>
        <BodyLong className='mb-4'>
          Arkiveringen skjer hvert 2 minutter. Du finner din etterlevelsesdokumentasjon i Public 360
          ved å søke på ditt etterlevelsesnummer. Etterlevelsesnummeret begynner med E etterfulgt av
          tre tall.
        </BodyLong>

        {etterlevelseDokumentasjon.p360CaseNumber && (
          <Link
            href={p360Url(etterlevelseDokumentasjon.p360Recno)}
            target='_blank'
            rel='noopener noreferrer'
          >
            Public 360 saksnummer {etterlevelseDokumentasjon.p360CaseNumber} (åpner i en ny fane)
          </Link>
        )}

        {isLoading && (
          <div className='flex w-full justify-center items-center mt-5'>
            <Loader size='3xlarge' className='flex justify-self-center' />
          </div>
        )}

        {!isLoading && (
          <div>
            <RadioGroup
              legend='Dokumentet skal inneholde'
              hideLegend
              value={onlyActiveKrav}
              onChange={(val: boolean) => setOnlyActiveKrav(val)}
            >
              <Radio value={false}>Arkiver alle krav versjoner</Radio>
              <Radio value={true}>Arkiver kun gjeldende versjon krav</Radio>
            </RadioGroup>
          </div>
        )}

        {successMessageOpen && (
          <Alert variant='success' closeButton onClose={() => setSuccessMessageOpen(false)}>
            Arkivering vellykket
          </Alert>
        )}

        {errorMessageOpen && (
          <Alert variant='error' closeButton onClose={() => setErrorMessageOpen(null)}>
            {errorMessageOpen}
          </Alert>
        )}

        <div className='flex justify-end pt-4 mt-4'>
          <Button
            className='mr-2.5'
            type='button'
            variant='secondary'
            disabled={isLoading}
            onClick={() => {
              setArkivModal(false)
            }}
          >
            Lukk
          </Button>
          <Button
            type='button'
            variant='primary'
            disabled={isLoading}
            onClick={async () => {
              try {
                setErrorMessageOpen(null)
                setIsLoading(true)
                const response = await arkiver(
                  etterlevelseDokumentasjon.id,
                  onlyActiveKrav,
                  false,
                  false
                )
                setSuccessMessageOpen(true)
                setEtterlevelseDokumentasjon({
                  ...etterlevelseDokumentasjon,
                  p360CaseNumber: response.p360CaseNumber,
                  p360Recno: response.p360Recno,
                })
              } catch (e: any) {
                const message = e?.response?.data?.message || e?.message || 'Arkivering feilet'
                setErrorMessageOpen(message)
              } finally {
                setIsLoading(false)
              }
            }}
          >
            Arkiver
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}
