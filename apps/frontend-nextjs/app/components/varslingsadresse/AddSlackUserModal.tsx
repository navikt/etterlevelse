'use client'

import { getSlackUserByEmail, usePersonSearch } from '@/api/teamkatalogen/teamkatalogenApi'
import { ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import {
  EAdresseType,
  IVarslingsadresse,
} from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { UserContext } from '@/provider/user/userProvider'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { Alert, Button, Loader, Modal, Radio, RadioGroup } from '@navikt/ds-react'
import { useContext, useState } from 'react'
import AsyncSelect from 'react-select/async'
import { DropdownIndicator } from '../common/dropdownIndicator/dropdownIndicator'
import { LabelWithDescription } from '../common/labelWithoTootip.tsx/LabelWithTooltip'
import { ContentLayout } from '../others/layout/content/content'

interface IProps {
  isOpen: boolean
  close: () => void
  doAdd: (v: IVarslingsadresse) => void
}

export const AddSlackUserModal = (props: IProps) => {
  const { isOpen, close, doAdd } = props
  const user = useContext(UserContext)
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
      width='medium'
    >
      <Modal.Body className='min-h-[31rem]'>
        <RadioGroup
          legend='Hvem skal varsles på Slack?'
          value={radioValue}
          onChange={(val) => {
            if (val === 'meg') {
              setVal(user.getEmail())
            } else {
              setVal('')
            }
            setRadioValue(val)
          }}
          className='w-full'
        >
          <Radio value='meg'>Meg ({user.getName()})</Radio>
          <Radio value='slack' className='w-full'>
            Noen andre
          </Radio>
        </RadioGroup>
        {radioValue === 'slack' && (
          <div className='pl-8 w-full'>
            <div className='flex flex-col'>
              <ContentLayout>
                <div className='w-full'>
                  <LabelWithDescription
                    label='Søk etter Slack-bruker'
                    description='Skriv minst 3 tegn'
                  />
                  <AsyncSelect
                    aria-label='Søk etter slack-bruker'
                    placeholder=''
                    noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
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
                    styles={selectOverrides}
                  />
                </div>
              </ContentLayout>
              {loadingSlackId && <Loader size='large' className='flex justify-self-center' />}
              {error && (
                <Alert className='mt-2.5' variant='error'>
                  {error}
                </Alert>
              )}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button type='button' onClick={() => addEmail(val)} className='ml-2.5'>
          Legg til Slack bruker
        </Button>
        <Button variant='secondary' type='button' onClick={close}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
