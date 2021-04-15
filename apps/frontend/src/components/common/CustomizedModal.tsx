import {Modal, ModalProps, SIZE} from 'baseui/modal'

const CuztomizedModal = (props: ModalProps) => {
  return (
    <Modal
        onClose={props.onClose}
        isOpen={props.isOpen}
        size={SIZE.full}
        overrides={{
          Dialog: {
            style: {
              backgroundColor: '#F8F8F8',
            }
          },
          DialogContainer: {
            style: {
              paddingLeft: '100px',
              paddingRight: '100px',
              width: 'calc(100% - 200px)'
            }
          },
          Close: {
            style: {
              display: 'none'
            }
          },
        }}
      >
        {props.children}
      </Modal>
  )
}
export default CuztomizedModal