import { FunctionComponent } from 'react'

type TProps = { message: string; noBulletPoint?: boolean }

export const Error: FunctionComponent<TProps> = ({ message, noBulletPoint }) => (
  <div
    className='navds-form-field__error pt-2'
    id='textField-error-rm'
    aria-relevant='additions removals'
    aria-live='polite'
  >
    <p className='navds-error-message navds-label flex gap-2'>
      {!noBulletPoint && <span>•</span>}
      {message}
    </p>
  </div>
)
