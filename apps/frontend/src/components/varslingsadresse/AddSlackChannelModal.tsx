import { BodyShort, Button, Modal } from '@navikt/ds-react'
import { useState } from 'react'
import { CSSObjectWithLabel } from 'react-select'
import AsyncSelect from 'react-select/async'
import { useSlackChannelSearch } from '../../api/TeamApi'
import { EAdresseType, ISlackChannel, IVarslingsadresse } from '../../constants'
import { ettlevColors } from '../../util/theme'
import { DropdownIndicator } from '../krav/Edit/KravBegreperEdit'

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
  const [channelName, setChannelName] = useState<string>('')

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
      width="medium"
    >
      <Modal.Body className="min-h-[18.75rem]">
        {val.adresse && channelName && <BodyShort>valgt kanal: #{channelName}</BodyShort>}

        <AsyncSelect
          aria-label="Søk etter slack-kanal"
          placeholder="Søk etter slack-kanal"
          noOptionsMessage={({ inputValue }) =>
            inputValue.length < 3
              ? 'Skriv minst tre tegn for å søke'
              : `Fant ingen resultater for "${inputValue}"`
          }
          controlShouldRenderValue={false}
          loadingMessage={() => 'Søker...'}
          isClearable={false}
          components={{ DropdownIndicator }}
          loadOptions={useSlackChannelSearch}
          onChange={(slackKanal) => {
            const channel = slackKanal as ISlackChannel
            if (channel) {
              setChannelName(channel.name || 'ingen navn')
              setVal({ type: EAdresseType.SLACK, adresse: channel.id })
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
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={() => add(val)} className="ml-2.5">
          Legg til Slack kannal
        </Button>
        <Button variant="secondary" type="button" onClick={close}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
