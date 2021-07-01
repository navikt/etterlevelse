import * as React from 'react'
import CustomizedModal from '../common/CustomizedModal'
import Button from '../common/Button'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { crossIcon } from '../Images'
import { ettlevColors } from '../../util/theme'
import { H1 } from 'baseui/typography'
import { Behandling } from '../../constants'
import { H2, Paragraph4 } from 'baseui/typography'
import { ButtonGroup, SHAPE } from 'baseui/button-group'
import { Button as BaseUIButton, SIZE } from 'baseui/button'
import { codelist, ListName } from '../../services/Codelist'

type EditBehandlingModalProps = {
    handleClose: () => void,
    showModal: boolean,
    behandling: Behandling
}

const paddingRight = theme.sizing.scale3200
const paddingLeft = theme.sizing.scale3200

const EditBehandlingModal = (props: EditBehandlingModalProps) => {
    const [selected, setSelected] = React.useState<number[]>([]);
    const options = codelist.getParsedOptions(ListName.RELEVANS)

    return (
        <CustomizedModal isOpen={!!props.showModal} onClose={props.handleClose}>
            <Block backgroundColor={ettlevColors.green800} height='100px' width="100%">
                <Block display='flex' justifyContent="space-between" paddingLeft={paddingLeft} paddingRight={theme.sizing.scale900}>
                    <Block>
                        <H1 color={ettlevColors.grey50} marginBottom='0px'>Tilpass egenskaper</H1>
                        <Paragraph4 $style={{ lineHeight: '20px', color: ettlevColors.grey50 }} marginTop={theme.sizing.scale0}>
                            Behandling, overordnet behandlingsaktivitet
                        </Paragraph4>
                    </Block>
                    <Block display="flex" justifyContent="flex-end" paddingLeft={theme.sizing.scale1000}>
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

            <Block paddingLeft={paddingLeft} paddingRight={paddingRight} marginTop={theme.sizing.scale1400}>
                <H2>Egenskaper til behandlingen</H2>

                <Block maxHeight='100px' height='100%' width="100%" backgroundColor={ettlevColors.grey50}>
                    <ButtonGroup
                        mode='checkbox'
                        shape={SHAPE.pill}
                        selected={selected}
                        onClick={(_event, index) => {
                            if (!selected.includes(index)) {
                                setSelected([...selected, index]);
                            } else {
                                setSelected(selected.filter(value => value !== index));
                            }
                        }}
                    >
                        {options.map(r => 
                            <BaseUIButton key={r.id}>{r.label}</BaseUIButton>
                        )}
                    </ButtonGroup>


                </Block>
            </Block>


        </CustomizedModal>
    )
}

export default EditBehandlingModal