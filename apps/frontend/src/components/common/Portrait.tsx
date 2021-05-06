import React, {useState} from 'react'
import {teamKatPersonImageLink} from '../../util/config'
import {Block} from 'baseui/block'
import {Spinner} from './Spinner'
import {questionmarkIcon} from '../Images'

export const Portrait = (props: {ident: string}) => {
  const [loading, setLoading] = useState(true)
  const [image, setImage] = React.useState(teamKatPersonImageLink(props.ident))
  const size = '30px'
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
