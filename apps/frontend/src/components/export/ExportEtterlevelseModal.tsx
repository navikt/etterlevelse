import { faFileWord } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Block } from 'baseui/block'
import { Button, KIND } from 'baseui/button'
import { SIZE } from 'baseui/input'
import React, { useState } from 'react'
import { env } from '../../util/env'
import CustomizedModal from '../common/CustomizedModal'
import { borderColor, borderRadius, borderStyle, borderWidth, marginZero } from '../common/Style'
import { ModalBody, ModalHeader } from 'baseui/modal'
import { Select, Value } from 'baseui/select'
import { customSelectOverrides } from '../krav/Edit/RegelverkEdit'
import { codelist, ListName } from '../../services/Codelist'
import axios from 'axios'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import { KIND as NKIND, Notification } from 'baseui/notification'
import { ParagraphMedium } from 'baseui/typography'
import { Loader } from '@navikt/ds-react'

type ExportEtterlevelseModalProps = {
  etterlevelseDokumentasjonId: String
}

export const ExportEtterlevelseModal = (props: ExportEtterlevelseModalProps) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  const [selectedTema, setSelectedTema] = useState<Value>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<String>('')

  return (
    <Block display="flex" alignItems="center" marginRight="12px">
      <Button kind={KIND.tertiary} size={SIZE.compact} onClick={() => setIsExportModalOpen(true)}>
        <Block marginRight="6px">
          <FontAwesomeIcon icon={faFileWord} />
        </Block>
        <Block>Eksporter</Block>
      </Button>

      <CustomizedModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false)
        }}
        size="default"
        overrides={{
          Dialog: {
            style: {
              width: '375px',
              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
              ...borderRadius('4px'),
            },
          },
        }}
      >
        <ModalHeader>Eksporter etterlevelse</ModalHeader>
        <ModalBody>
          {isLoading ? (
            <Block display="flex" justifyContent="center" width="100%">
              <Loader size="large" />
            </Block>
          ) : (
            <Block>
              <Select
                placeholder="Velg et tema for eksportering"
                options={codelist.getParsedOptions(ListName.TEMA)}
                value={selectedTema}
                onChange={({ value }) => {
                  setErrorMessage('')
                  setSelectedTema(value)
                }}
                overrides={customSelectOverrides}
              />
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
                      <ParagraphMedium marginBottom="0px" marginTop="0px" $style={{ lineHeight: '18px' }}>
                        {errorMessage}
                      </ParagraphMedium>
                    </Block>
                  </Notification>
                </Block>
              )}
              <Block marginTop="16px" display="flex" $style={{ justifyContent: 'flex-end', paddingTop: '16px' }}>
                <Button
                  kind={KIND.primary}
                  size={SIZE.compact}
                  onClick={() => {
                    ;(async () => {
                      setIsLoading(true)
                      setErrorMessage('')
                      const exportUrl =
                        selectedTema.length > 0
                          ? `${env.backendBaseUrl}/export/etterlevelsedokumentasjon?etterlevelseDokumentasjonId=${props.etterlevelseDokumentasjonId}&temakode=${selectedTema[0].id}`
                          : `${env.backendBaseUrl}/export/etterlevelsedokumentasjon?etterlevelseDokumentasjonId=${props.etterlevelseDokumentasjonId}`

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
                  <Block marginRight="6px">
                    <FontAwesomeIcon icon={faFileWord} />
                  </Block>
                  <Block>{selectedTema.length > 0 ? 'Eksporter med valgt tema' : 'Eksporter alle tema'}</Block>
                </Button>
              </Block>
            </Block>
          )}
        </ModalBody>
      </CustomizedModal>
    </Block>
  )
}

export default ExportEtterlevelseModal
