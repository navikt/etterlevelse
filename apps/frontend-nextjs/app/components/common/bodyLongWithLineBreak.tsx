import { BodyLong } from '@navikt/ds-react'
import { FunctionComponent, HTMLAttributes } from 'react'

type TProps = {
  children: string
} & HTMLAttributes<HTMLDivElement>

const BodyLongWithLineBreak: FunctionComponent<TProps> = ({ children, className, ...props }) => (
  <BodyLong {...props} className={`wrap-break-word ${className ?? ''}`.trim()}>
    {children.split('\n').map((line: string, idx: number) => (
      <span key={idx}>
        {line}
        <br />
      </span>
    ))}
  </BodyLong>
)

export default BodyLongWithLineBreak
