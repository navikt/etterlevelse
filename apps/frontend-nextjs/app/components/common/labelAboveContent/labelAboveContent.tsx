import { TOr } from '@/constants/commonConstants'
import { FunctionComponent, ReactNode } from 'react'
import DataText from '../dataText/dataText'
import { Markdown } from '../markdown/markdown'

const empty = (arg: any) => !arg || (Array.isArray(arg) && !arg.length)

type TLabelProps = {
  title: string
  hide?: boolean
  header?: boolean
  p1?: boolean
  labelWidth?: string
  fullWidth?: boolean
} & TOr<{ children: ReactNode }, { markdown: string; vertical?: boolean }>

export const LabelAboveContent: FunctionComponent<TLabelProps> = (props) => {
  const { hide, children, markdown, fullWidth, title, header, labelWidth, p1, vertical } = props

  if (hide || (empty(children) && empty(markdown))) return null

  return (
    <DataText fullWidth={fullWidth} notFlexed label={title} header={header} labelWidth={labelWidth}>
      {markdown && <Markdown p1={p1} source={markdown} vertical={vertical} shortenLinks />}
      {!markdown && children}
    </DataText>
  )
}
