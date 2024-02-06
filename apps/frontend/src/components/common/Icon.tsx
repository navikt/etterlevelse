/* TODO USIKKER */
import { Block } from 'baseui/block'

interface IPropsIconInCircle {
  icon: string
  alt: string
  size: string
  backgroundColor: string
}

export const IconInCircle = ({ icon, alt, size, backgroundColor }: IPropsIconInCircle) => (
  <Block
    $style={{
      backgroundColor: backgroundColor,
      borderRadius: '100%',
      padding: '7.5%',
    }}
  >
    <img src={icon} alt={alt} width={size} />
  </Block>
)
