import { EtterlevelseMetadata } from '../../constants'
import { StatefulPopover } from 'baseui/popover'
import { Block } from 'baseui/block'
import { Button as BaseButton } from 'baseui/button'
import { PLACEMENT } from 'baseui/tooltip'
import Button from '../common/Button'
import { createEtterlevelseMetadata, updateEtterlevelseMetadata } from '../../api/EtterlevelseMetadataApi'
import { user } from '../../services/User'
import { ettlevColors } from '../../util/theme'
import { LabelSmall } from 'baseui/typography'
import { borderColor, borderStyle, borderWidth } from '../common/Style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

type TildeltPopoverProps = {
  etterlevelseMetadata: EtterlevelseMetadata
  setEtterlevelseMetadata: Function
  icon: IconDefinition
  iconColor?: string
}

export const TildeltPopoever = ({ etterlevelseMetadata, setEtterlevelseMetadata, icon, iconColor }: TildeltPopoverProps) => {

  return (
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
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.14), 0px 2px 1px rgba(38, 38, 38, 0.12), 0px 1px 3px rgba(38, 38, 38, 0.2)',
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
        <Block padding={'20px'}>
          <Button
            kind="underline-hover"
            onClick={() => {
              const ident = user.getName()
              if (etterlevelseMetadata.tildeltMed && user.getName() === etterlevelseMetadata.tildeltMed[0] && etterlevelseMetadata.id !== 'ny') {
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
              {etterlevelseMetadata.tildeltMed && user.getName() === etterlevelseMetadata.tildeltMed[0] ? 'Fjern meg selv' : 'Tildel meg selv'}
            </LabelSmall>
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
        style={{
          width: '24px',
          height: '24px',
        }}
        type="button"
      >
        <FontAwesomeIcon icon={icon} color={iconColor ? iconColor : 'inherit'} title="Tildel meg selv" />
      </BaseButton>
    </StatefulPopover>
  )
}
export default TildeltPopoever
