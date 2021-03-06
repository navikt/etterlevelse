import { Modal, ModalProps, SIZE } from 'baseui/modal'
import _ from 'lodash'
import { maxPageWidth } from '../../util/theme'

const CuztomizedModal = (props: ModalProps) => {
  const { overrides, ...otherProps } = props

  const customOverrides = {
    Dialog: {
      style: {
        backgroundColor: '#F8F8F8',
        maxWidth: `calc(${maxPageWidth} - 80px)`,
        width: '100%'
      },
    },
    DialogContainer: {
      style: {
        paddingLeft: '100px',
        paddingRight: '100px',
        width: 'calc(100% - 200px)',
      },
    },
    Close: {
      style: {
        display: 'none',
      },
    },
  }

  const mergedOverrides = _.merge(customOverrides, props.overrides)

  return <Modal {...otherProps} unstable_ModalBackdropScroll size={SIZE.full} overrides={mergedOverrides} />
}
export default CuztomizedModal
