import { Button, Loader, Modal, Select } from '@navikt/ds-react'
import axios from 'axios'
import { Block } from 'baseui/block'
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
        header={{ heading: 'Eksporter etterlevelse', closeButton: false }}
      >
        <Modal.Body>
          {isLoading ? (
            <Block display="flex" justifyContent="center" width="100%">
              <Loader size="large" />
            </Block>
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
              {errorMessage && (
                <Block width="100%" marginTop="16px">
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
                    <Block display="flex" justifyContent="center">
                      <ParagraphMedium
                        marginBottom="0px"
                        marginTop="0px"
                        $style={{ lineHeight: '18px' }}
                      >
                        {errorMessage}
                      </ParagraphMedium>
                    </Block>
                  </Notification>
                </Block>
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
