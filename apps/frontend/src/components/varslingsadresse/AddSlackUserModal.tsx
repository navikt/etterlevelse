import { Alert, BodyShort, Button, Loader, Modal } from '@navikt/ds-react'
import { useState } from 'react'
import { CSSObjectWithLabel } from 'react-select'
import AsyncSelect from 'react-select/async'
import { getSlackUserByEmail, usePersonSearch } from '../../api/TeamApi'
import { EAdresseType, ITeamResource, IVarslingsadresse } from '../../constants'
import { user } from '../../services/User'
import { ettlevColors } from '../../util/theme'
import { DropdownIndicator } from '../krav/Edit/KravBegreperEdit'

interface IProps {
  isOpen: boolean
  close: () => void
  doAdd: (v: IVarslingsadresse) => void
}

export const AddSlackUserModal = (props: IProps) => {
  const { isOpen, close, doAdd } = props
  const [val, setVal] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [error, setError] = useState('')
  const [loadingSlackId, setLoadingSlackId] = useState(false)

  const addEmail = (email: string) => {
    setLoadingSlackId(true)
    getSlackUserByEmail(email)
      .then((user) => {
        doAdd({ type: EAdresseType.SLACK_USER, adresse: user.id })
        setLoadingSlackId(false)
        setError('')
        setUserName('')
        close && close()
      })
      .catch((e) => {
        setError('Fant ikke slack for bruker, error: ' + e.toString())
        setLoadingSlackId(false)
      })
  }

  return (
    <Modal
      open={isOpen}
      onClose={close}
      header={{ heading: 'Legg til Slack bruker', closeButton: false }}
      width="medium"
    >
      <Modal.Body className="min-h-[18.75rem]">
        {userName && <BodyShort>Valgt bruker: {userName}</BodyShort>}
        <div className="flex flex-col">
          <div className="flex w-full">
            <div className="w-full">
              <AsyncSelect
                aria-label="Søk etter slack-bruker"
                placeholder="Søk etter slack-bruker"
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length < 3
                    ? 'Skriv minst tre tegn for å søke'
                    : `Fant ingen resultater for "${inputValue}"`
                }
                controlShouldRenderValue={false}
                loadingMessage={() => 'Søker...'}
                isClearable={false}
                loadOptions={usePersonSearch}
                components={{ DropdownIndicator }}
                onFocus={() => setError('')}
                onBlur={() => setError('')}
                onChange={(person) => {
                  const resource = person as ITeamResource
                  if (resource) {
                    setLoadingSlackId(true)
                    setUserName(resource.fullName)
                    setVal(resource.email)
                    setLoadingSlackId(false)
                  }
                }}
                styles={{
                  control: (base) =>
                    ({
                      ...base,
                      cursor: 'text',
                      height: '3rem',
                      borderColor: ettlevColors.textAreaBorder,
                    }) as CSSObjectWithLabel,
                }}
              />
            </div>
          </div>
          {loadingSlackId && <Loader size="large" />}
          {error && (
            <Alert className="mt-2.5" variant="error">
              {error}
            </Alert>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={() => addEmail(user.getEmail())}>
          Legg til min Slack bruker
        </Button>
        <Button type="button" onClick={() => addEmail(val)} className="ml-2.5">
          Legg til Slack bruker
        </Button>
        <Button variant="secondary" type="button" onClick={close}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
