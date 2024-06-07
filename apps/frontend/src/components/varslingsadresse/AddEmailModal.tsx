import { Button, Modal, TextField } from '@navikt/ds-react'
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
  const [val, setVal] = useState('')
  const [error, setError] = useState('')

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

  const onKey = (e: React.KeyboardEvent) => e.key === 'Enter' && add()
  return (
    <Modal
      open={isOpen}
      onClose={close}
      header={{ heading: 'Legg til Epost adresse', closeButton: false }}
      width="medium"
    >
      <Modal.Body>
        <TextField
          label="epost"
          hideLabel
          onKeyDown={onKey}
          value={val}
          onFocus={() => setError('')}
          onChange={(e) => setVal((e.target as HTMLInputElement).value)}
          className={`w-full ${error ? 'border-2 rounded-md border-[#c30000]' : ''}`}
        />
        {error && <Error message={error} />}
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={() => add(user.getEmail())}>
          Legg til min Epost
        </Button>
        <Button type="button" onClick={() => add(val)} className="ml-2.5">
          Legg til Epost
        </Button>
        <Button variant="secondary" type="button" onClick={close}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
