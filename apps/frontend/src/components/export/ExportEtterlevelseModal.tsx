import { Button, Loader, Modal, Select } from '@navikt/ds-react'
import axios from 'axios'

/* TODO USIKKER */
import { KIND as NKIND, Notification } from 'baseui/notification'
import { ParagraphMedium } from 'baseui/typography'
import { useState } from 'react'
import { EListName, codelist } from '../../services/Codelist'
import { env } from '../../util/env'
import { ettlevColors } from '../../util/theme'
import { borderColor, borderRadius, borderStyle, borderWidth, marginZero } from '../common/Style'

type TExportEtterlevelseModalProps = {
  etterlevelseDokumentasjonId: string
}

export const ExportEtterlevelseModal = (props: TExportEtterlevelseModalProps) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [valgtTema, setValgtTema] = useState<string>('')

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
        header={{ heading: 'Eksporter etterlevelse' }}
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
                <option key="" value="">
                  Velg tema
                </option>
                {codelist.getParsedOptions(EListName.TEMA).map((opt) => (
                  <option key={`option_${opt.value}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {errorMessage && (
                <div className="w-full mt-4">
                  <Notification
                    overrides={{
                      Body: {
                        style: {
                          width: 'auto',
                          ...marginZero,
                          ...borderStyle('solid'),
                          ...borderWidth('1px'),
                          ...borderColor(ettlevColors.red600),
                          ...borderRadius('4px'),
                        },
                      },
                    }}
                    kind={NKIND.negative}
                  >
                    <div className="flex justify-center">
                      <ParagraphMedium
                        marginBottom="0px"
                        marginTop="0px"
                        $style={{ lineHeight: '18px' }}
                      >
                        {errorMessage}
                      </ParagraphMedium>
                    </div>
                  </Notification>
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
                      const exportUrl = `${env.backendBaseUrl}/export/etterlevelsedokumentasjon?etterlevelseDokumentasjonId=${props.etterlevelseDokumentasjonId}`

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
                      const exportUrl = `${env.backendBaseUrl}/export/etterlevelsedokumentasjon?etterlevelseDokumentasjonId=${props.etterlevelseDokumentasjonId}&temakode=${valgtTema}`

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
