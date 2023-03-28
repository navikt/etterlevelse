import {Block} from 'baseui/block'
import {KIND as NKIND, Notification} from 'baseui/notification'
import {paddingZero} from '../common/Style'
import * as React from 'react'
import {ModalLabel} from '../common/ModalSchema'

export const ErrorMessageModal = (props: { msg: any; fullWidth?: boolean }) => (
  <Block display="flex" width="100%" marginTop=".2rem">
    {!props.fullWidth && <ModalLabel />}
    <Block width="100%">
      <Notification overrides={{ Body: { style: { width: 'auto', ...paddingZero, marginTop: 0, backgroundColor: 'transparent' } } }} kind={NKIND.negative}>
        {props.msg}
      </Notification>
    </Block>
  </Block>
)
