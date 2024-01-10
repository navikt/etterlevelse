import { Block } from 'baseui/block';

export const IconInCircle = (props: { icon: string; alt: string; size: string; backgroundColor: string }) => (
  <Block
    $style={{
      backgroundColor: props.backgroundColor,
      borderRadius: '100%',
      padding: '7.5%',
    }}
  >
    <img src={props.icon} alt={props.alt} width={props.size} />
  </Block>
)
