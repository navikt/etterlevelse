import {ErrorMessage} from 'formik'
import {Block} from 'baseui/block'
import {KIND as NKIND, Notification} from 'baseui/notification'
import {Label2} from 'baseui/typography'
import * as React from 'react'
import {theme} from '../../util'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons'
import {paddingZero} from './Style'
import CustomizedStatefulTooltip from "./CustomizedStatefulTooltip";

export const Error = (props: { fieldName: string, fullWidth?: boolean }) => (
    <ErrorMessage name={props.fieldName}>
        {msg => (
            <Block display="flex" width="100%" marginTop=".2rem">
                {!props.fullWidth && <ModalLabel/>}
                <Block width="100%">
                    <Notification overrides={{Body: {style: {width: 'auto', ...paddingZero, marginTop: 0}}}}
                                  kind={NKIND.negative}>{msg}</Notification>
                </Block>
            </Block>
        )}
    </ErrorMessage>
)

export const ModalLabel = (props: { label?: any, tooltip?: string | React.ReactElement, fullwidth?: boolean }) => {
    const width = props.fullwidth ? {witdh: '100%'} : {minWidth: '25%', maxWidth: '25%'}
    return (
        <Block {...width} alignSelf="center" paddingRight="1rem">
            {props.tooltip ?
                <CustomizedStatefulTooltip content={props.tooltip}>
                    <Label2 font="font300" display="flex" width="100%" justifyContent='flex-start'>
                        <Block display='flex'>
                            <Block>{props.label}</Block>
                            <Block>
                                <FontAwesomeIcon style={{marginLeft: '.5rem', alignSelf: 'center'}}
                                                 icon={faExclamationCircle} color={theme.colors.primary300}
                                                 size="sm"/>
                            </Block>
                        </Block>
                    </Label2>
                </CustomizedStatefulTooltip>
                : <Label2 font="font300">{props.label}</Label2>
            }
        </Block>
    )
}
