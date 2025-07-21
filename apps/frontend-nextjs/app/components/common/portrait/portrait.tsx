import { avatarPlaceholder } from '@/components/others/images/images'
import { personImageLink } from '@/util/config/utils'
import { Loader } from '@navikt/ds-react'
import Image from 'next/image'
import { useState } from 'react'

export const Portrait = (props: { ident: string; size?: string }) => {
  const [loading, setLoading] = useState(true)
  const [image] = useState(personImageLink(props.ident))
  const [error, setError] = useState<boolean>(false)

  return (
    <div className='w-11 h-11'>
      {loading && <Loader size={'large'} className='flex justify-self-center' />}
      {!error && (
        <Image
          width={loading ? 0 : '44'}
          height={loading ? 0 : '44'}
          onLoad={() => {
            setLoading(false)
            setError(false)
          }}
          onError={() => {
            setError(true)
            setLoading(false)
          }}
          src={image}
          alt='Avatar icon'
          aria-hidden
          style={{
            width: loading ? 0 : '100%',
            height: loading ? 0 : '100%',
            borderRadius: '100%',
          }}
        />
      )}
      {error && (
        <Image
          src={avatarPlaceholder}
          alt='Avatar icon'
          aria-hidden
          width={loading ? 0 : '44'}
          height={loading ? 0 : '44'}
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
