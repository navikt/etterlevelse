import React, {useState} from 'react'
import {personImageLink} from '../../util/config'
import {Block} from 'baseui/block'
import {Spinner} from './Spinner'
import {questionmarkIcon} from '../Images'

export const Portrait = (props: {ident: string, size?: string}) => {
  const [loading, setLoading] = useState(true)
  const [image, setImage] = React.useState(personImageLink(props.ident))
  const size = props.size || '42px'
  return (
    <Block>
      {loading && <Block width={size} height={size}><Spinner size='100%'/></Block>}
      <img
        onLoad={() => setLoading(false)}
        onError={() => {
          setImage(questionmarkIcon)
          setLoading(false)
        }}
        src={image}
        alt={`Profilbilde ${props.ident}`}
        style={{
          width: loading ? 0 : size,
          height: loading ? 0 : size,
          borderRadius: '100%'
        }}
      />
    </Block>
  )
}
