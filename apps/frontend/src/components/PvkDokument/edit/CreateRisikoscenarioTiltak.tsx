import {
  Accordion,
  BodyLong,
  Button,
  DatePicker,
  Heading,
  List,
  TextField,
  useDatepicker,
} from '@navikt/ds-react'
import { useState } from 'react'
import { TextAreaField } from '../../common/Inputs'

export const CreateRisikoscenarioTiltak = () => {
  const [hasError, setHasError] = useState(false)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const { datepickerProps, inputProps } = useDatepicker({
    fromDate: new Date('Aug 23 2019'), // add todays date as default WIP
    onValidate: (val) => {
      setHasError(!val.isValidDate)
    },
  })

  return (
    <Accordion className="mt-5">
      <Accordion.Item>
        <Accordion.Header>Risikoscenario eksempel 1 (WIP)</Accordion.Header>
        <Accordion.Content>
          {/* This is just sample text: WIP*/}
          <div>
            <BodyLong>
              <b>Beskriv risikoscenarioet:</b>Lorem ipsum dolor sit amet, consectetur adipiscing
              elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
              minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
              consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
              dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
              in culpa qui officia deserunt mollit anim id est laborum.
            </BodyLong>
            <BodyLong className="mt-3">
              <b>Begrunn sannsynlighetsnivået:</b> Moderat sannsynlig
            </BodyLong>
            <BodyLong className="mt-3">
              <b>Konsekvensnivå:</b> Svært alvorlig konsekvens
            </BodyLong>
            <BodyLong className="mt-3">
              <b>Risikoscenarioet har følgende tiltak:</b>
            </BodyLong>

            <List>
              <List.Item>Ingen tiltak er registrert</List.Item>
            </List>
          </div>

          {!isEdit && (
            <div className="flex gap-2 mt-5">
              <Button onClick={() => setIsEdit(true)} type="button">
                Opprett nytt tiltak
              </Button>
              <Button variant="secondary">Legg til eksisterende tiltak</Button>
              <Button onClick={() => setIsEdit(true)} type="button" variant="secondary">
                Redigér risikoscenario
              </Button>
            </div>
          )}

          {isEdit && (
            <div>
              <div className="border-b-[5px] border-[#8269a2] border-border-divider w-full" />

              <Heading level="2" size="small" className="my-5">
                Opprett tiltak
              </Heading>

              <TextField
                label="Navngi tiltaket"
                description="Velg et navn som lett kan skilles fra andre tiltak dere oppretter"
              />

              <div className="mt-5">
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label="Beskriv tiltaket nærmere (valgfritt)"
                  name="tiltakBeskrivelse"
                />
              </div>

              <TextField
                className="mt-5"
                label="Hvem er tiltaksansvarlig?"
                description="Skriv for eksempel teamnavn, rolle(r), eller lignende."
              />

              <div className="min-h-96 mt-5">
                <DatePicker {...datepickerProps}>
                  <DatePicker.Input
                    {...inputProps}
                    label="Legg inn tiltaksfrist"
                    error={hasError && 'Noe er feil'}
                  />
                </DatePicker>
              </div>

              <div className="flex gap-2 mt-5">
                <Button type="button">Lagre tiltak</Button>
                <Button onClick={() => setIsEdit(false)} type="button" variant="secondary">
                  Avbryt
                </Button>
              </div>
            </div>
          )}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  )
}

export default CreateRisikoscenarioTiltak
