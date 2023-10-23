import {Block} from 'baseui/block'
import {ModalHeader} from 'baseui/modal'
import Button from './Button'
import CustomizedModal from './CustomizedModal'
import {borderRadius, marginAll} from './Style'

type AlertUnsavedPopupProps = {
  isActive: boolean
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClose: Function
  onSubmit: Function
}

export const AlertUnsavedPopup = ({ isActive, isModalOpen, setIsModalOpen, onClose, onSubmit }: AlertUnsavedPopupProps) => {
  return (
    <CustomizedModal
      onClose={() => setIsModalOpen(false)}
      isOpen={isModalOpen}
      size="default"
      overrides={{
        Root:{
          style: {
            zIndex:100
          }
        },
        Dialog: {
          style: {
            ...borderRadius('0px'),
            ...marginAll('0px'),
            maxWidth: '500px',
            width: '100%',
          },
        },
      }}
    >
      <Block width="100%">
        <ModalHeader>Er du sikkert på at du vil forlate redigerings siden uten å lagre?</ModalHeader>
        <Block paddingBottom="32px" paddingLeft="24px" paddingRight="32px" display="flex" justifyContent="flex-end">
          <Button
            onClick={() => {
              onSubmit()
              setIsModalOpen(false)
            }}
          >
            Lagre og fortsett
          </Button>
          <Button
            marginLeft
            onClick={() => {
              onClose()
              setIsModalOpen(false)
            }}
          >
            Fortsett uten å lagre
          </Button>
          <Button
            marginLeft
            kind="secondary"
            onClick={() => {
              setIsModalOpen(false)
            }}
          >
            Avbryt
          </Button>
        </Block>
      </Block>
    </CustomizedModal>
  )
}
export default AlertUnsavedPopup
