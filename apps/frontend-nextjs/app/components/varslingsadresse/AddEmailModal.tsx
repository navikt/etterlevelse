'use client'

import {
  EAdresseType,
  TVarslingsadresseQL,
} from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { UserContext } from '@/provider/user/userProvider'
import { Button, Label, Modal, Radio, RadioGroup, TextField } from '@navikt/ds-react'
import { useContext, useState } from 'react'
import { Error } from '../common/modalSchema/ModalSchema'
import { emailValidator } from './VarslingsadresserEdit'

interface IProps {
  isOpen: boolean
  close: () => void
  doAdd: (v: TVarslingsadresseQL) => void
  added?: TVarslingsadresseQL[]
}

export const AddEmailModal = (props: IProps) => {
  const { isOpen, close, doAdd, added } = props
  const { getEmail } = useContext(UserContext)
  const [val, setVal] = useState(getEmail())
  const [error, setError] = useState('')
  const [radioValue, setRadioValue] = useState('meg')

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
    close()
  }

  return (
    <Modal
      open={isOpen}
      onClose={close}
      header={{ heading: 'Legg til Epost adresse', closeButton: false }}
      width='medium'
    >
      <Modal.Body className='min-h-[18.75rem]'>
        <RadioGroup
          legend='Hvem skal varsles på Epost?'
          value={radioValue}
          onChange={(val) => {
            if (val === 'meg') {
              setVal(getEmail())
            } else {
              setVal('')
            }
            setRadioValue(val)
          }}
          className='w-full'
        >
          <Radio value='meg'>Meg ({getEmail()})</Radio>
          <Radio value='epost' className='w-full'>
            Noen andre
          </Radio>
        </RadioGroup>

        {radioValue === 'epost' && (
          <div className='w-full pl-8'>
            <Label>Skriv Epost adresse</Label>
            <TextField
              label=''
              hideLabel
              value={val}
              onFocus={() => setError('')}
              onChange={(e) => setVal((e.target as HTMLInputElement).value)}
              className={`w-full ${error ? 'border-2 rounded-md border-[#c30000]' : ''}`}
            />
            {error && <Error message={error} />}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button type='button' onClick={() => add(val)} className='ml-2.5'>
          Legg til Epost
        </Button>
        <Button variant='secondary' type='button' onClick={close}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
