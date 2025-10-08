'use client'

import {
  createEtterlevelseMetadata,
  updateEtterlevelseMetadata,
} from '@/api/etterlevelseMetadata/etterlevelseMetadataApi'
import { IEtterlevelseMetadata } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseMetadataConstants'
import { UserContext } from '@/provider/user/userProvider'
import { BodyShort, Button } from '@navikt/ds-react'
import { FunctionComponent, useContext } from 'react'

type TProps = {
  etterlevelseMetadata: IEtterlevelseMetadata
  setEtterlevelseMetadata: (state: IEtterlevelseMetadata) => void
}

export const TildeltTil: FunctionComponent<TProps> = ({
  etterlevelseMetadata,
  setEtterlevelseMetadata,
}) => {
  const user = useContext(UserContext)

  return (
    <div className='flex items-center gap-2'>
      <BodyShort size='small'>
        {etterlevelseMetadata &&
        etterlevelseMetadata.tildeltMed &&
        etterlevelseMetadata.tildeltMed.length >= 1
          ? 'Tildelt ' + etterlevelseMetadata.tildeltMed[0]
          : 'Ikke tildelt'}
      </BodyShort>
      <Button
        variant='tertiary'
        size='small'
        onClick={() => {
          const ident = user.getName()
          if (
            etterlevelseMetadata.tildeltMed &&
            user.getName() === etterlevelseMetadata.tildeltMed[0] &&
            etterlevelseMetadata.id !== 'ny'
          ) {
            updateEtterlevelseMetadata({
              ...etterlevelseMetadata,
              tildeltMed: [],
            }).then((resp) => {
              setEtterlevelseMetadata(resp)
            })
          } else if (etterlevelseMetadata.id !== 'ny') {
            updateEtterlevelseMetadata({
              ...etterlevelseMetadata,
              tildeltMed: [ident],
            }).then((resp) => {
              setEtterlevelseMetadata(resp)
            })
          } else {
            createEtterlevelseMetadata({
              ...etterlevelseMetadata,
              id: '',
              tildeltMed: [ident],
            }).then((resp) => {
              setEtterlevelseMetadata(resp)
            })
          }
        }}
      >
        {etterlevelseMetadata.tildeltMed && user.getName() === etterlevelseMetadata.tildeltMed[0]
          ? 'Fjern meg selv'
          : 'Tildel meg selv'}
      </Button>
    </div>
  )
}
export default TildeltTil
