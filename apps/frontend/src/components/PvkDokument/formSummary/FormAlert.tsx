import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyLong } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  children: string
}

export const FormAlert: FunctionComponent<TProps> = ({ children }) => {
  return (
    <BodyLong className='text-[#BC002A] flex gap-3 w-full'>
      <ExclamationmarkTriangleFillIcon title='Advarsel' height='1.5em' width='1.5em' />{' '}
      <strong>{children}</strong>
    </BodyLong>
  )
}
export default FormAlert
