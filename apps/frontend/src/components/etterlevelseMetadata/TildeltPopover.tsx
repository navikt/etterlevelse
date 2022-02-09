import { EtterlevelseMetadata } from '../../constants'
import { StatefulPopover } from 'baseui/popover'
import { Block } from 'baseui/block'
import { Button as BaseButton } from 'baseui/button'
import { PLACEMENT } from 'baseui/tooltip'
import Button from '../common/Button'
import { createEtterlevelseMetadata, updateEtterlevelseMetadata } from '../../api/EtterlevelseMetadataApi'
import { user } from '../../services/User'

type TildeltPopoverProps = {
  etterlevelseMetadata: EtterlevelseMetadata
}

export const TildeltPopoever = ({ etterlevelseMetadata }: TildeltPopoverProps) => {
  return (
    <StatefulPopover
      content={() => (
        <Block padding={'20px'}>
          <Button onClick={() => {
            if (etterlevelseMetadata.id) {
              updateEtterlevelseMetadata({
                ...etterlevelseMetadata,
                tildeltMed: [user.getIdent.toString()]
              })
            } else {
              createEtterlevelseMetadata({
                ...etterlevelseMetadata,
                tildeltMed: [user.getIdent.toString()],
              } as EtterlevelseMetadata)
            }
          }}>Tildelt med meg</Button>
        </Block>
      )}
      returnFocus
      autoFocus
      showArrow={true}
      placement={PLACEMENT.bottom}
    >
      <BaseButton>Click me</BaseButton>
    </StatefulPopover>
  )
}
export default TildeltPopoever

