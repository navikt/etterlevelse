import { ArrowDownIcon, ArrowUpIcon, ArrowsSquarepathIcon } from '@navikt/aksel-icons'
import { Button, Dropdown, TextField, Tooltip } from '@navikt/ds-react'
import { useEffect, useState } from 'react'

interface IProps {
  label: string
  index: number
  arrayLength: number
  updateIndex: (newIndex: number) => void
  marginLeft?: boolean
}

export const RearrangeButtons = (props: IProps) => {
  const { label, index, arrayLength, updateIndex, marginLeft } = props
  const [plassering, setPlassering] = useState<string>((index + 1).toString())

  useEffect(() => {
    setPlassering((index + 1).toString())
  }, [index])

  return (
    <div className={`flex ${marginLeft ? 'ml-10' : ''}`}>
      {index !== 0 && (
        <Tooltip content={'Flytt ' + label + ' opp'}>
          <Button
            className="mr-2.5"
            type="button"
            variant="secondary"
            onClick={() => {
              updateIndex(index - 1)
            }}
            icon={
              <ArrowUpIcon
                title={'Flytt ' + label + ' opp'}
                aria-label={'Flytt ' + label + ' opp'}
              />
            }
          />
        </Tooltip>
      )}
      {index !== arrayLength - 1 && (
        <Tooltip content={'Flytt ' + label + ' ned'}>
          <Button
            className="mr-2.5"
            type="button"
            variant="secondary"
            onClick={() => {
              updateIndex(index + 1)
            }}
            icon={
              <ArrowDownIcon
                title={'Flytt ' + label + ' ned'}
                aria-label={'Flytt ' + label + ' ned'}
              />
            }
          />
        </Tooltip>
      )}
      {arrayLength !== 1 && (
        <Dropdown>
          <Tooltip content={'Endre ' + label + ' rekkefølge'}>
            <Button
              as={Dropdown.Toggle}
              type="button"
              variant="secondary"
              icon={
                <ArrowsSquarepathIcon
                  title={'Endre ' + label + ' rekkefølge'}
                  aria-label={'Endre ' + label + ' rekkefølge'}
                />
              }
            />
          </Tooltip>
          <Dropdown.Menu>
            <TextField
              label="Angi ønsket plassering"
              value={plassering}
              onChange={(event) => setPlassering(event.target.value)}
              error={parseInt(plassering) ? undefined : 'Skriv et tall større enn 0'}
            />
            <Dropdown.Menu.List>
              <Dropdown.Menu.List.Item
                as={Button}
                type="button"
                variant="primary"
                onClick={() => {
                  const newIndex = parseInt(plassering)
                  if (newIndex) {
                    updateIndex(newIndex - 1)
                  }
                }}
              >
                Bytt plassering
              </Dropdown.Menu.List.Item>
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  )
}
