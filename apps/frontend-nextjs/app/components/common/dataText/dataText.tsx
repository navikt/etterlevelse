import { Heading, Label } from '@navikt/ds-react'
import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  label?: string
  text?: false | string | string[]
  children?: ReactNode
  hideComponent?: boolean
  notFlexed?: boolean
  header?: boolean
  labelWidth?: string
  fullWidth?: boolean
}

const DataText: FunctionComponent<TProps> = (props) => {
  const { hideComponent, fullWidth, header, label, notFlexed, children } = props

  if (hideComponent) return null

  let labelWidth = 'w-48'
  if (labelWidth) {
    labelWidth = `'w-['${labelWidth}']'`
  } else if (fullWidth) {
    labelWidth = 'w-full'
  }
  const getLabel = () => {
    if (header) {
      return (
        <div>
          <Heading size='small' level='2'>
            {label}
          </Heading>
        </div>
      )
    } else {
      return (
        <div className={`${labelWidth} pr-2.5`}>
          <Label size='medium'>{label}</Label>
        </div>
      )
    }
  }

  return (
    <div className={`${notFlexed ? 'block' : 'flex'} w-full`}>
      {label && getLabel()}
      {children}
    </div>
  )
}

export default DataText
