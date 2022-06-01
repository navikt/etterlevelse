import React, { useState } from 'react'
import { personImageLink } from '../../util/config'
import { Block } from 'baseui/block'
import { Spinner } from './Spinner'
import { faUser } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { avatarPlaceholder } from '../Images'

export const Portrait = (props: { ident: string; size?: string }) => {
  const [loading, setLoading] = useState(true)
  const [image, setImage] = React.useState(personImageLink(props.ident))
  const [error, setError] = React.useState<boolean>(false)
  const size = props.size || '42px'
  return (
    <Block width={size} height={size}>
      {loading && <Spinner size="100%" />}
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
    </Block>
  )
}
