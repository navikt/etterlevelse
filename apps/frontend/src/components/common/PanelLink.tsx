import { Block, BlockOverrides } from 'baseui/block'
import { theme } from '../../util'

export type TPanelLinkCardOverrides = {
  Root?: BlockOverrides
  Header?: BlockOverrides
  Content?: BlockOverrides
}

export const Chevron = ({
  hover,
  icon,
  distance,
  size,
  marginLeft,
}: {
  hover: boolean
  icon: string
  distance: string
  size?: string
  marginLeft?: string
}) => (
  <Block
    marginLeft={
      hover
        ? `calc(${theme.sizing.scale600} + ${distance})`
        : marginLeft
          ? marginLeft
          : theme.sizing.scale600
    }
    alignSelf={'center'}
    marginRight={hover ? '-' + distance : 0}
  >
    <img
      src={icon}
      aria-hidden
      alt={'Chevron høyre ikon'}
      width={size ? size : '24px'}
      height={size ? size : '24px'}
    />
  </Block>
)
