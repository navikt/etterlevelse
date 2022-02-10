import { EtterlevelseMetadata } from '../../constants'
import { StatefulPopover } from 'baseui/popover'
import { Block } from 'baseui/block'
import { Button as BaseButton } from 'baseui/button'
import { PLACEMENT } from 'baseui/tooltip'
import Button from '../common/Button'
import { createEtterlevelseMetadata, updateEtterlevelseMetadata } from '../../api/EtterlevelseMetadataApi'
import { user } from '../../services/User'
import { ettlevColors } from '../../util/theme'

type TildeltPopoverProps = {
  etterlevelseMetadata: EtterlevelseMetadata
  setEtterlevelseMetadata: Function
}

export const TildeltPopoever = ({ etterlevelseMetadata, setEtterlevelseMetadata }: TildeltPopoverProps) => {
  return (
    <StatefulPopover
      overrides={{
        Inner: {
          style: {
            backgroundColor: ettlevColors.white
          }
        }
      }}
      content={() => (
        <Block padding={'20px'}>
          <Button
            kind="tertiary"
            onClick={() => {
              const ident = user.getName()
              if (etterlevelseMetadata.id !== 'ny') {
                updateEtterlevelseMetadata({
                  ...etterlevelseMetadata,
                  tildeltMed: [ident]
                }).then((resp) => {
                  setEtterlevelseMetadata(resp)
                })
              } else {
                createEtterlevelseMetadata({
                  ...etterlevelseMetadata,
                  tildeltMed: [ident],
                }).then((resp) => {
                  setEtterlevelseMetadata(resp)
                })
              }
            }}>
            Tildelt med meg
          </Button>
        </Block>
      )}
      returnFocus
      autoFocus
      showArrow={true}
      placement={PLACEMENT.bottom}
    >
      <BaseButton
        kind="tertiary"
      >
        Click me
      </BaseButton>
    </StatefulPopover>
  )
}
export default TildeltPopoever

