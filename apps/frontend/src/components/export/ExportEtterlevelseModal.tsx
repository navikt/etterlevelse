import { faFileWord } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Block } from 'baseui/block'
import { Button, KIND } from 'baseui/button'
import { SIZE } from 'baseui/input'
import { StyledLink } from 'baseui/link'
import React, { useState } from 'react'
import { env } from '../../util/env'
import CustomizedModal from '../common/CustomizedModal'
import { borderRadius } from '../common/Style'
import { ModalBody, ModalHeader } from 'baseui/modal'
import { Select, Value } from 'baseui/select'
import { customSelectOverrides } from '../krav/Edit/KravRegelverkEdit'
import { codelist, ListName } from '../../services/Codelist'

type ExportEtterlevelseModalProps = {
  behandlingId: String
}

export const ExportEtterlevelseModal = (props: ExportEtterlevelseModalProps) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  const [selectedTema, setSelectedTema] = useState<Value>([])


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
        <ModalHeader>Exporter Etterlevelse</ModalHeader>
        <ModalBody>
          <Block>
            <Select
              placeholder="Velg tema"
              options={codelist.getParsedOptions(ListName.TEMA)}
              value={selectedTema}
              onChange={({ value }) => setSelectedTema(value)}
              overrides={customSelectOverrides}
            />
          </Block>
          <Block marginTop="16px" display="flex" $style={{ justifyContent: 'flex-end', paddingTop: '16px' }}>
            <StyledLink
              style={{ textDecoration: 'none' }}
              href={
                selectedTema.length > 0 ? 
                `${env.backendBaseUrl}/export/etterlevelse?behandlingId=${props.behandlingId}&temakode=${selectedTema[0].id}` :
                `${env.backendBaseUrl}/export/etterlevelse?behandlingId=${props.behandlingId}`
              }
            >
              <Button kind={KIND.tertiary} size={SIZE.compact}>
                <Block marginRight="6px">
                  <FontAwesomeIcon icon={faFileWord} />
                </Block>
                <Block>{selectedTema.length > 0 ? 'Eksporter med valg tema' : 'Eksporter alle'}</Block>
              </Button>
            </StyledLink>
          </Block>
        </ModalBody>
      </CustomizedModal>
    </Block>
  )
}

export default ExportEtterlevelseModal