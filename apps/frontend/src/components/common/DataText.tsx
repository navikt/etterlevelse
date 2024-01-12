import { Heading, Label } from '@navikt/ds-react'
import { ReactNode } from 'react'

type TDataTextProps = {
  label?: string
  text?: false | string | string[]
  children?: ReactNode
  hideComponent?: boolean
  notFlexed?: boolean
  header?: boolean
  labelWidth?: string
  fullWidth?: boolean
}

const DataText = (props: TDataTextProps) => {
  if (props.hideComponent) return null

  let labelWidth = 'w-48'
  if (props.labelWidth) {
    labelWidth = 'w-[' + props.labelWidth + ']'
  } else if (props.fullWidth) {
    labelWidth = 'w-full'
  }
  const getLabel = () => {
    if (props.header) {
      return (
        <div>
          <Heading size="small" level="2">
            {props.label}
          </Heading>
        </div>
      )
    } else {
      return (
        <div className={`${labelWidth} pr-2.5`}>
          <Label size={'medium'}>{props.label}</Label>
        </div>
      )
    }
  }

  return (
    <div className={`${props.notFlexed ? 'block' : 'flex'} w-full`}>
      {props.label && getLabel()}
      {props.children}
    </div>
  )
}

export default DataText
