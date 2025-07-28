import { BodyShort } from '@navikt/ds-react'

export const UpdateMessage = ({ message }: { message?: string }) => {
  return (
    <div>
      {message ? (
        <div>
          {message.match('error') ? (
            <BodyShort className='text-nav-red'>{message}</BodyShort>
          ) : (
            <BodyShort>{message}</BodyShort>
          )}
        </div>
      ) : (
        <div />
      )}
    </div>
  )
}
