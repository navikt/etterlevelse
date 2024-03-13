import { BodyShort, Box, Button, Loader, Modal, Radio, RadioGroup, Select } from '@navikt/ds-react'
import axios from 'axios'
import { useState } from 'react'
import { EListName, codelist } from '../../services/Codelist'
import { env } from '../../util/env'

type TExportEtterlevelseModalProps = {
  etterlevelseDokumentasjonId: string
}

export const ExportEtterlevelseModal = (props: TExportEtterlevelseModalProps) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [valgtTema, setValgtTema] = useState<string>('')
  const [onlyActiveKrav, setOnlyActiveKrav] = useState<boolean>(false)

  return (
    <div>
      <Button variant="tertiary" size="small" onClick={() => setIsExportModalOpen(true)}>
        Eksporter til Word
      </Button>

      <Modal
        open={isExportModalOpen}
        onClose={() => {
          setValgtTema('')
          setIsExportModalOpen(false)
        }}
        header={{ heading: 'Eksporter etterlevelse', closeButton: false }}
      >
        <Modal.Body>
          {isLoading ? (
            <div className="flex justify-center w-full">
              <Loader size="large" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Select
                label="Velg et tema for eksportering"
                onChange={(ev) => setValgtTema(ev.currentTarget.value)}
                value={valgtTema}
              >
                <option key="" value=""></option>
                {codelist.getParsedOptions(EListName.TEMA).map((codeListOption) => (
                  <option key={`option_${codeListOption.value}`} value={codeListOption.value}>
                    {codeListOption.label}
                  </option>
                ))}
              </Select>
              <RadioGroup
                legend="Skal dokumentet ta med alle krav eller kun aktiv krav?"
                value={onlyActiveKrav}
                onChange={(val: boolean) => setOnlyActiveKrav(val)}
              >
                <Radio value={false}>Ta med alle</Radio>
                <Radio value={true}>Kun aktiv krav</Radio>
              </RadioGroup>
              {errorMessage && (
                <div className="w-full mt-4">
                  <Box className="mb-2.5" padding="4" background="surface-warning-subtle">
                    <div className="flex justify-center">
                      <BodyShort>{errorMessage}</BodyShort>
                    </div>
                  </Box>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="tertiary"
                  onClick={() => {
                    setValgtTema('')
                    setIsExportModalOpen(false)
                  }}
                >
                  Avbryt
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    ;(async () => {
                      setIsLoading(true)
                      setErrorMessage('')
                      const exportUrl = `${env.backendBaseUrl}/export/etterlevelsedokumentasjon?etterlevelseDokumentasjonId=${props.etterlevelseDokumentasjonId}&onlyActiveKrav=${onlyActiveKrav}`

                      axios
                        .get(exportUrl)
                        .then(() => {
                          window.location.href = exportUrl
                          setIsLoading(false)
                        })
                        .catch((e) => {
                          setErrorMessage(e.response.data.message)
                          setIsLoading(false)
                        })
                    })()
                  }}
                >
                  Eksporter alle tema
                </Button>
                <Button
                  variant="primary"
                  disabled={valgtTema == ''}
                  onClick={() => {
                    ;(async () => {
                      setIsLoading(true)
                      setErrorMessage('')
                      const exportUrl = `${env.backendBaseUrl}/export/etterlevelsedokumentasjon?etterlevelseDokumentasjonId=${props.etterlevelseDokumentasjonId}&temakode=${valgtTema}&onlyActiveKrav=${onlyActiveKrav}`

                      axios
                        .get(exportUrl)
                        .then(() => {
                          window.location.href = exportUrl
                          setIsLoading(false)
                          setIsExportModalOpen(false)
                        })
                        .catch((e) => {
                          setErrorMessage(e.response.data.message)
                          setIsLoading(false)
                        })
                    })()
                  }}
                >
                  Eksporter valgt tema
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default ExportEtterlevelseModal
