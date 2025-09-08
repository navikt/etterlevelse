import { BodyShort, Box, Button, Loader, Modal, Radio, RadioGroup } from '@navikt/ds-react'
import axios from 'axios'
import { useState } from 'react'
import { env } from '../../util/env'

type TExportPvkModalProps = {
  etterlevelseDokumentasjonId: string
}

export const ExportPvkModal = (props: TExportPvkModalProps) => {
  const { etterlevelseDokumentasjonId } = props
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [onlyActiveKrav, setOnlyActiveKrav] = useState<boolean>(false)

  return (
    <div>
      <Button
        variant='tertiary'
        size='small'
        type='button'
        onClick={() => setIsExportModalOpen(true)}
      >
        Eksportér dokumentet
      </Button>

      <Modal
        width='30rem'
        open={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false)
        }}
        header={{ heading: 'Eksportér personvernskonsekvensvurdering', closeButton: false }}
      >
        <Modal.Body>
          {isLoading ? (
            <div className='flex justify-center w-full'>
              <Loader size='large' />
            </div>
          ) : (
            <div className='flex flex-col gap-4'>
              <RadioGroup
                legend='Dokumentet skal inneholde'
                hideLegend
                value={onlyActiveKrav}
                onChange={(value: boolean) => setOnlyActiveKrav(value)}
              >
                <Radio value={false}>Eksportér alle krav versjoner</Radio>
                <Radio value={true}>Eksportér kun gjeldende versjon krav</Radio>
              </RadioGroup>
              {errorMessage && (
                <div className='w-full mt-4'>
                  <Box className='mb-2.5' padding='4' background='surface-warning-subtle'>
                    <div className='flex justify-center'>
                      <BodyShort>{errorMessage}</BodyShort>
                    </div>
                  </Box>
                </div>
              )}
              <div className='flex justify-end gap-2'>
                <Button
                  variant='tertiary'
                  onClick={() => {
                    setIsExportModalOpen(false)
                  }}
                >
                  Avbryt
                </Button>
                <Button
                  variant='primary'
                  onClick={() => {
                    ;(async () => {
                      setIsLoading(true)
                      setErrorMessage('')
                      const exportUrl = `${env.backendBaseUrl}/export/pvkdokument?etterlevelseDokumentasjonId=${etterlevelseDokumentasjonId}&onlyActiveKrav=${onlyActiveKrav}`
                      axios
                        .get(exportUrl)
                        .then(() => {
                          window.location.href = exportUrl
                          setIsLoading(false)
                          setIsExportModalOpen(false)
                        })
                        .catch((error: any) => {
                          setErrorMessage(error.response.data.message)
                          setIsLoading(false)
                        })
                    })()
                  }}
                >
                  Eksportér
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default ExportPvkModal
