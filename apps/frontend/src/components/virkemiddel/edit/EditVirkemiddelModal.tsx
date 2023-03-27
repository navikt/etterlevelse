import { Block } from 'baseui/block'
import { ModalBody, ModalHeader } from 'baseui/modal'
import { useState } from 'react'
import { Virkemiddel } from '../../../constants'
import { codelist, ListName } from '../../../services/Codelist'
import Button from '../../common/Button'
import CustomizedModal from '../../common/CustomizedModal'
import { editIcon, plusIcon } from '../../Images'

type EditVirkemiddelModalProps = {
  virkemiddel?: Virkemiddel
  setVirkemiddel?: (v: Virkemiddel) => void
  isEdit?: boolean
}

export const EditVirkemiddelModal = (props: EditVirkemiddelModalProps) => {
  const virkemiddelTypeOptions = codelist.getParsedOptions(ListName.VIRKEMIDDELTYPE)
  const lovOptions = codelist.getParsedOptions(ListName.LOV)
  const [isVirkemiddelModalOpen, setIsVirkemiddelModalOpen] = useState<boolean>(false)

  return (
    <Block>
      <Button
        onClick={() => setIsVirkemiddelModalOpen(true)}
        startEnhancer={props.isEdit ? <img src={editIcon} alt="edit icon" /> : <img src={plusIcon} alt="plus icon" />}
        size="compact"
      >
        {props.isEdit ? 'Rediger virkemiddel' : 'Nytt virkemiddel'}
      </Button>

      <CustomizedModal isOpen={!!isVirkemiddelModalOpen} onClose={() => setIsVirkemiddelModalOpen(false)}>
        <ModalHeader>{props.isEdit ? 'Rediger virkemiddel' : 'Opprett nytt virkemiddel'}</ModalHeader>
        <ModalBody>
          <Button type="button" onClick={() => setIsVirkemiddelModalOpen(false)} marginLeft={true}>
            Avbryt
          </Button>
        </ModalBody>
      </CustomizedModal>
    </Block>
  )
}
