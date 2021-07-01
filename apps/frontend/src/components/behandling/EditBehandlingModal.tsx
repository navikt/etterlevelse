import * as React from 'react'
import CustomizedModal from '../common/CustomizedModal'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { crossIcon } from '../Images'
import { Button } from 'baseui/button'
import { ettlevColors } from '../../util/theme'
import { H1 } from 'baseui/typography'

type EditBehandlingModalProps = {
    handleClose: () => void,
    showModal: boolean
}

const paddingRight = theme.sizing.scale1000
const paddingLeft = '140px'

const customOverrides = {
    Dialog: {
        style: {
            backgroundColor: '#F8F8F8',
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

const EditBehandlingModal = (props: EditBehandlingModalProps) => {

    return (
        <CustomizedModal isOpen={!!props.showModal} onClose={props.handleClose}>
            <Block backgroundColor={ettlevColors.green800} height='100px' width="100%">
                <Block display='flex' justifyContent="space-between" paddingLeft={paddingLeft} paddingRight={paddingRight}>
                    <Block><H1 color={ettlevColors.grey50}>Test</H1></Block>
                    <Block display="flex" justifyContent="flex-end">
                        <Button
                            kind="tertiary"
                            onClick={props.handleClose}
                            $style={{ ':hover': { backgroundColor: 'transparent' } }}
                        >
                            <img src={crossIcon} alt="close" />
                        </Button>
                    </Block>
                </Block>
            </Block>


        </CustomizedModal>
    )
}

export default EditBehandlingModal