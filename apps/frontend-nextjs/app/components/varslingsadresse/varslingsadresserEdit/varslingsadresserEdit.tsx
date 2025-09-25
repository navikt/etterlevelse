'use client'

import { Error } from '@/components/common/error/error'
import { ContentLayout } from '@/components/others/layout/content/content'
import {
  EAdresseType,
  IVarslingsadresse,
} from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { UserContext } from '@/provider/user/userProvider'
import { emailValidator } from '@/util/teamkatalog/utils'
import { PlusIcon } from '@navikt/aksel-icons'
import { Button, TextField } from '@navikt/ds-react'
import { ChangeEvent, KeyboardEvent, useContext, useState } from 'react'

type TProps = {
  add: (varslingsadresse: IVarslingsadresse) => void
  added?: IVarslingsadresse[]
  close?: () => void
}

export const AddEmail = ({ added, add: doAdd, close }: TProps) => {
  const [val, setVal] = useState('')
  const [error, setError] = useState('')
  const { getEmail } = useContext(UserContext)

  const add = (adresse?: string) => {
    const toAdd = adresse || val
    if (!toAdd) return
    if (!added || !added.find((va) => va.adresse === toAdd)) {
      if (!emailValidator.isValidSync(toAdd)) {
        setError('Ikke gyldig @nav.no epost adresse')
        return
      }
      doAdd({ type: EAdresseType.EPOST, adresse: toAdd })
      setVal('')
    }
    if (close) {
      close()
    }
  }

  const onKey = (event: KeyboardEvent) => event.key === 'Enter' && add()
  return (
    <div className='flex flex-col'>
      <ContentLayout>
        <TextField
          label='epost'
          hideLabel
          onKeyDown={onKey}
          value={val}
          onFocus={() => setError('')}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setVal((event.target as HTMLInputElement).value)
          }
          onBlur={() => add()}
          className={`w-full ${error ? 'border-2 rounded-md border-[#c30000]' : ''}`}
        />
        <div className='flex justify-between ml-2.5'>
          <Button type='button' onClick={() => add(getEmail())}>
            Meg
          </Button>
          <Button type='button' onClick={() => add} className='ml-2.5'>
            <PlusIcon title='legg til epost' aria-label='legg til epost' />
          </Button>
        </div>
      </ContentLayout>
      {error && <Error message={error} />}
    </div>
  )
}
