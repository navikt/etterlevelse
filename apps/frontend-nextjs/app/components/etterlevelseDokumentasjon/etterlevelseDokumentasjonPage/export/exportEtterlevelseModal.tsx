'use client'

import { EListName } from '@/constants/kodeverk/kodeverkConstants'
import { CodelistContext, IGetParsedOptionsProps } from '@/provider/kodeverk/kodeverkProvider'
import { env } from '@/util/env/env'
import { BodyShort, Box, Button, Loader, Modal, Radio, RadioGroup, Select } from '@navikt/ds-react'
import axios from 'axios'
import { ChangeEvent, useContext, useState } from 'react'

type TExportEtterlevelseModalProps = {
  etterlevelseDokumentasjonId: string
}

export const ExportEtterlevelseModal = (props: TExportEtterlevelseModalProps) => {
  const { etterlevelseDokumentasjonId } = props
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [valgtTema, setValgtTema] = useState<string>('')
  const [onlyActiveKrav, setOnlyActiveKrav] = useState<boolean>(false)
  const codelist = useContext(CodelistContext)

  return (
    <div>
      <Button variant='tertiary' size='small' onClick={() => setIsExportModalOpen(true)}>
        Eksporter til Word
      </Button>

      <Modal
        width='30rem'
        open={isExportModalOpen}
        onClose={() => {
          setValgtTema('')
          setIsExportModalOpen(false)
        }}
        header={{ heading: 'Eksporter etterlevelse', closeButton: false }}
      >
        <Modal.Body>
          {isLoading ? (
            <div className='flex justify-center w-full'>
              <Loader size='large' />
            </div>
          ) : (
            <div className='flex flex-col gap-4'>
              <Select
                label='Velg et tema for eksportering'
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setValgtTema(event.currentTarget.value)
                }
                value={valgtTema}
              >
                <option key='' value=''>
                  Alle tema
                </option>
                {codelist.utils
                  .getParsedOptions(EListName.TEMA)
                  .map((codeListOption: IGetParsedOptionsProps) => (
                    <option key={`option_${codeListOption.value}`} value={codeListOption.value}>
                      {codeListOption.label}
                    </option>
                  ))}
              </Select>
              <RadioGroup
                legend='Dokumentet skal inneholde'
                hideLegend
                value={onlyActiveKrav}
                onChange={(value: boolean) => setOnlyActiveKrav(value)}
              >
                <Radio value={false}>Eksporter alle krav versjoner</Radio>
                <Radio value={true}>Eksporter kun gjeldende versjon krav</Radio>
              </RadioGroup>
              {errorMessage && (
                <div className='w-full mt-4'>
                  <Box className='mb-2.5' padding='space-4' background='warning-soft'>
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
                    setValgtTema('')
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
                      let exportUrl = `${env.backendBaseUrl}/export/etterlevelsedokumentasjon?etterlevelseDokumentasjonId=${etterlevelseDokumentasjonId}`
                      if (valgtTema !== '') {
                        exportUrl += `&temakode=${valgtTema}&onlyActiveKrav=${onlyActiveKrav}`
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
                      } else {
                        exportUrl += `&onlyActiveKrav=${onlyActiveKrav}`
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
                      }
                    })()
                  }}
                >
                  Eksporter
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
