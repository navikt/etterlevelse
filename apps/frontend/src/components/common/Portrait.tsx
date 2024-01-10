import { Loader } from '@navikt/ds-react'
import { useState } from 'react'
import { personImageLink } from '../../util/config'
import { avatarPlaceholder } from '../Images'

export const Portrait = (props: { ident: string; size?: string }) => {
  const [loading, setLoading] = useState(true)
  const [image] = useState(personImageLink(props.ident))
  const [error, setError] = useState<boolean>(false)
  return (
    <div className="w-11 h-11">
      {loading && <Loader size={'large'} />}
      {!error ? (
        <img
          onLoad={() => {
            setLoading(false)
            setError(false)
          }}
          onError={() => {
            setError(true)
            setLoading(false)
          }}
          src={image}
          alt="Avatar icon"
          aria-hidden
          style={{
            width: loading ? 0 : '100%',
            height: loading ? 0 : '100%',
            borderRadius: '100%',
          }}
        />
      ) : (
        <img
          src={avatarPlaceholder}
          alt="Avatar icon"
          aria-hidden
          style={{
            width: loading ? 0 : '100%',
            height: loading ? 0 : '100%',
            borderRadius: '100%',
          }}
        />
      )}
    </div>
  )
}
