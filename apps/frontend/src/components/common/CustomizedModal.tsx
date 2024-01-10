import { Modal, ModalProps, SIZE } from 'baseui/modal'
import _ from 'lodash'
import { maxPageWidth } from '../../util/theme'

type TCustomModalProps = {
  closeIconColor?: string
  closeIconHoverColor?: string
  disableCloseIcon?: boolean
}

const CuztomizedModal = (props: TCustomModalProps & ModalProps) => {
  const { closeIconColor, closeIconHoverColor, disableCloseIcon, ...otherProps } = props

  const customOverrides = {
    Dialog: {
      style: {
        backgroundColor: '#F8F8F8',
        maxWidth: `calc(${maxPageWidth} - 80px)`,
        width: '100%',
      },
    },
    DialogContainer: {
      style: {
        paddingLeft: '10px',
        paddingRight: '10px',
        width: 'calc(100% - 20px)',
      },
    },
    Close: {
      style: {
        display: disableCloseIcon ? 'none' : undefined,
        color: closeIconColor ? closeIconColor : undefined,
        ':hover': {
          color: closeIconHoverColor ? closeIconHoverColor : undefined,
        },
      },
    },
  }

  const mergedOverrides = _.merge(customOverrides, props.overrides)

  return (
    <Modal {...otherProps} size={props.size ? props.size : SIZE.full} overrides={mergedOverrides} />
  )
}
export default CuztomizedModal
