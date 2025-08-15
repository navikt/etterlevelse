export const Error = ({ message, noBulletPoint }: { message: string; noBulletPoint?: boolean }) => (
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
