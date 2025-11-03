import { BodyLong } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  children: string
}

export const BodyLongWithLineBreak: FunctionComponent<TProps> = ({ children }) => {
  return (
    <BodyLong>
      {children.split('\n').map((line: string, idx: number) => (
        <span key={idx}>
          {line}
          <br />
        </span>
      ))}
    </BodyLong>
  )
}

export default BodyLongWithLineBreak
