import { Button, Modal } from '@navikt/ds-react'
import { useState } from 'react'
import AsyncSelect from 'react-select/async'
import { useSlackChannelSearch } from '../../api/TeamApi'
import { EAdresseType, ISlackChannel, IVarslingsadresse } from '../../constants'
import { LabelWithDescription } from '../common/LabelWithTooltip'
import { DropdownIndicator } from '../krav/Edit/KravBegreperEdit'
import { noOptionMessage, selectOverrides } from '../search/util'

interface IProps {
  isOpen: boolean
  close: () => void
  doAdd: (v: IVarslingsadresse) => void
}

export const AddSlackChannelModal = (props: IProps) => {
  const { isOpen, close, doAdd } = props
  const [val, setVal] = useState<{ type: EAdresseType; adresse: string }>({
    type: EAdresseType.SLACK,
    adresse: '',
  })

  const add = (value?: { type: EAdresseType; adresse: string }) => {
    const toAdd = value || val
    if (!toAdd.adresse) return
    doAdd(toAdd)
    setVal({
      type: EAdresseType.SLACK,
      adresse: '',
    })
    close()
  }

  return (
    <Modal
      open={isOpen}
      onClose={close}
      header={{ heading: 'Legg til Slack-kanal', closeButton: false }}
      width='medium'
    >
      <Modal.Body className='min-h-[18.75rem]'>
        <LabelWithDescription label='Søk etter Slack-kanal' description='Skriv minst 3 tegn' />
        <AsyncSelect
          aria-label='Søk etter slack-kanal'
          placeholder=''
          noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
          loadingMessage={() => 'Søker...'}
          isClearable={false}
          components={{ DropdownIndicator }}
          loadOptions={useSlackChannelSearch}
          onChange={(slackKanal) => {
            const channel = slackKanal as ISlackChannel
            if (channel) {
              setVal({ type: EAdresseType.SLACK, adresse: channel.id })
            }
          }}
          styles={selectOverrides}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button type='button' onClick={() => add(val)} className='ml-2.5'>
          Legg til Slack kanal
        </Button>
        <Button variant='secondary' type='button' onClick={close}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
