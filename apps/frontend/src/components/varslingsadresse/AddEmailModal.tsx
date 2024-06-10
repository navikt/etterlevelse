import { Button, Label, Modal, Radio, RadioGroup, TextField } from '@navikt/ds-react'
import { useState } from 'react'
import { EAdresseType, IVarslingsadresse } from '../../constants'
import { user } from '../../services/User'
import { Error } from '../common/ModalSchema'
import { emailValidator } from './VarslingsadresserEdit'

interface IProps {
  isOpen: boolean
  close: () => void
  doAdd: (v: IVarslingsadresse) => void
  added?: IVarslingsadresse[]
}

export const AddEmailModal = (props: IProps) => {
  const { isOpen, close, doAdd, added } = props
  const [val, setVal] = useState(user.getEmail())
  const [error, setError] = useState('')
  const [radioValue, setRadioValue] = useState('meg')

  const closeAndResetState = () => {
    setVal(user.getEmail())
    setError('')
    setRadioValue('meg')
    close()
  }

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
    closeAndResetState()
  }

  return (
    <Modal
      open={isOpen}
      onClose={closeAndResetState}
      header={{ heading: 'Legg til Epost adresse', closeButton: false }}
      width="medium"
    >
      <Modal.Body className="min-h-[18.75rem]">
        <RadioGroup
          legend="Hvem skal varsles på Epost"
          value={radioValue}
          onChange={(val) => {
            if (val === 'meg') {
              setVal(user.getEmail())
            } else {
              setVal('')
            }
            setRadioValue(val)
          }}
          className="w-full"
        >
          <Radio value="meg">Meg ({user.getEmail()})</Radio>
          <Radio value="epost" className="w-full">
            Noen andre
          </Radio>
        </RadioGroup>

        {radioValue === 'epost' && (
          <div className="w-full pl-8">
            <Label>Skriv Epost adresse</Label>
            <TextField
              label=""
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
        <Button type="button" onClick={() => add(val)} className="ml-2.5">
          Legg til Epost
        </Button>
        <Button variant="secondary" type="button" onClick={closeAndResetState}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
