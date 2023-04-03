import { Block } from 'baseui/block'
import { Notification } from 'baseui/notification'
import { paddingZero } from '../common/Style'
import * as React from 'react'
import { ModalLabel } from '../common/ModalSchema'
import { ettlevColors } from '../../util/theme'

export const ErrorMessageModal = (props: { msg: any; fullWidth?: boolean }) => (
  <Block display="flex" width="100%" marginTop=".2rem">
    {!props.fullWidth && <ModalLabel />}
    <Block width="100%">
      <Notification overrides={{ Body: { style: { width: 'auto', ...paddingZero, marginTop: 0, backgroundColor: 'transparent', color: ettlevColors.red600 } } }}>
        {props.msg}
      </Notification>
    </Block>
  </Block>
)
