import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

/* TODO USIKKER */
import { Button as BaseButton } from 'baseui/button'
import { StatefulPopover } from 'baseui/popover'
import { PLACEMENT } from 'baseui/tooltip'
import { LabelSmall } from 'baseui/typography'
import {
  createEtterlevelseMetadata,
  updateEtterlevelseMetadata,
} from '../../api/EtterlevelseMetadataApi'
import { IEtterlevelseMetadata } from '../../constants'
import { user } from '../../services/User'
import { ettlevColors } from '../../util/theme'
import Button from '../common/Button'
import { borderColor, borderStyle, borderWidth } from '../common/Style'

type TTildeltPopoverProps = {
  etterlevelseMetadata: IEtterlevelseMetadata
  setEtterlevelseMetadata: React.Dispatch<React.SetStateAction<IEtterlevelseMetadata>>
  icon: IconDefinition
  iconColor?: string
}

export const TildeltPopoever = ({
  etterlevelseMetadata,
  setEtterlevelseMetadata,
  icon,
  iconColor,
}: TTildeltPopoverProps) => (
  <StatefulPopover
    focusLock={true}
    overrides={{
      Inner: {
        style: {
          backgroundColor: ettlevColors.white,
        },
      },
      Body: {
        style: {
          borderRadius: '4px',
          ...borderColor('#E3E3E3'),
          ...borderStyle('solid'),
          ...borderWidth('1px'),
          boxShadow:
            '0px 1px 1px rgba(0, 0, 0, 0.14), 0px 2px 1px rgba(38, 38, 38, 0.12), 0px 1px 3px rgba(38, 38, 38, 0.2)',
        },
      },
      Arrow: {
        style: {
          backgroundColor: ettlevColors.white,
          ...borderColor('#E3E3E3'),
          ...borderStyle('solid'),
          ...borderWidth('1px'),
        },
      },
    }}
    content={({ close }) => (
      <div className="p-5">
        <Button
          kind="underline-hover"
          onClick={() => {
            const ident = user.getName()
            if (
              etterlevelseMetadata.tildeltMed &&
              user.getName() === etterlevelseMetadata.tildeltMed[0] &&
              etterlevelseMetadata.id !== 'ny'
            ) {
              updateEtterlevelseMetadata({
                ...etterlevelseMetadata,
                tildeltMed: [],
              }).then((resp) => {
                setEtterlevelseMetadata(resp)
                close()
              })
            } else if (etterlevelseMetadata.id !== 'ny') {
              updateEtterlevelseMetadata({
                ...etterlevelseMetadata,
                tildeltMed: [ident],
              }).then((resp) => {
                setEtterlevelseMetadata(resp)
                close()
              })
            } else {
              createEtterlevelseMetadata({
                ...etterlevelseMetadata,
                tildeltMed: [ident],
              }).then((resp) => {
                setEtterlevelseMetadata(resp)
                close()
              })
            }
          }}
        >
          <LabelSmall $style={{ fontWeight: 600 }}>
            {etterlevelseMetadata.tildeltMed &&
            user.getName() === etterlevelseMetadata.tildeltMed[0]
              ? 'Fjern meg selv'
              : 'Tildel meg selv'}
          </LabelSmall>
        </Button>
      </div>
    )}
    returnFocus
    showArrow={true}
    placement={PLACEMENT.bottom}
  >
    <BaseButton
      kind="tertiary"
      style={{
        width: '24px',
        height: '24px',
      }}
      type="button"
    >
      <FontAwesomeIcon
        icon={icon}
        color={iconColor ? iconColor : 'inherit'}
        title="Tildel meg selv"
      />
    </BaseButton>
  </StatefulPopover>
)

export default TildeltPopoever
