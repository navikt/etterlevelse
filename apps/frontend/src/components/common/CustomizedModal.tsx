import {Modal, ModalProps, SIZE} from 'baseui/modal'

const CuztomizedModal = (props: ModalProps) => {
  const {overrides, ...otherProps} = props

  const customOverrides = {
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
  }

  return (
    <Modal
      {...otherProps}
      unstable_ModalBackdropScroll
      size={SIZE.full}
      overrides={{...customOverrides, ...props.overrides}}
    />
  )
}
export default CuztomizedModal
