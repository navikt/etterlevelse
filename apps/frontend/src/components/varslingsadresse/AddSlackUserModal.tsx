import { Alert, Button, Loader, Modal, Radio, RadioGroup } from '@navikt/ds-react'
import { useState } from 'react'
import { CSSObjectWithLabel } from 'react-select'
import AsyncSelect from 'react-select/async'
import { getSlackUserByEmail, usePersonSearch } from '../../api/TeamApi'
import { EAdresseType, ITeamResource, IVarslingsadresse } from '../../constants'
import { user } from '../../services/User'
import { ettlevColors } from '../../util/theme'
import { LabelWithDescription } from '../common/LabelWithTooltip'
import { DropdownIndicator } from '../krav/Edit/KravBegreperEdit'

interface IProps {
  isOpen: boolean
  close: () => void
  doAdd: (v: IVarslingsadresse) => void
}

export const AddSlackUserModal = (props: IProps) => {
  const { isOpen, close, doAdd } = props
  const [val, setVal] = useState<string>(user.getEmail())
  const [error, setError] = useState('')
  const [loadingSlackId, setLoadingSlackId] = useState(false)
  const [radioValue, setRadioValue] = useState('meg')

  const addEmail = (email: string) => {
    setLoadingSlackId(true)
    getSlackUserByEmail(email)
      .then((user) => {
        doAdd({ type: EAdresseType.SLACK_USER, adresse: user.id })
        setLoadingSlackId(false)
        setError('')
        close()
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
      header={{ heading: 'Legg til Slack-bruker', closeButton: false }}
      width="medium"
    >
      <Modal.Body className="min-h-[31rem]">
        <RadioGroup
          legend="Hvem skal varsles på Slack?"
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
          <Radio value="meg">Meg ({user.getName()})</Radio>
          <Radio value="slack" className="w-full">
            Noen andre
          </Radio>
        </RadioGroup>
        {radioValue === 'slack' && (
          <div className="pl-8 w-full">
            <div className="flex flex-col">
              <div className="flex w-full">
                <div className="w-full">
                  <LabelWithDescription
                    label="Søk etter Slack-bruker"
                    description="Skriv minst tre tegn"
                  />
                  <AsyncSelect
                    aria-label="Søk etter slack-bruker"
                    placeholder=""
                    noOptionsMessage={({ inputValue }) => {
                      if (inputValue.length < 3 && inputValue.length > 0) {
                        return 'Skriv minst tre tegn for å søke'
                      } else if (inputValue.length >= 3) {
                        return `Fant ingen resultater for "${inputValue}"`
                      } else {
                        return ''
                      }
                    }}
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
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
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
