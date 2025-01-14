import {Button, Label, TextField, Select} from '@navikt/ds-react'
import {FieldArray, FieldArrayRenderProps} from 'formik'
import {ChangeEvent, useState} from 'react'
//import {IRegelverk} from '../../constants'
//import {LovView} from '../Lov'
import {FieldWrapper} from '../common/Inputs'
import LabelWithTooltip from '../common/LabelWithTooltip'
import {Error, FormError} from '../common/ModalSchema'
//import {RenderTagList} from '../common/TagList'

export const ROSEdit = () => {
  const [source, setSource] = useState('')
  const [id, setId] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  return (
    <FieldWrapper marginBottom id="ros">
      <FieldArray name="ros">
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          const add = (): void => {
            if (source === '') {
              setError('Du må velge en kilde')
              return
            }
            if (id === '') {
              setError('Du må legge til en identifikator')
              return
            }
            if (description === '') {
              setError('Legg til en beskrivelse')
              return
            }
            setError('')
            console.log("ROS link lagt til (TODO)", source, id, description)
            console.log(fieldArrayRenderProps.form.values)
            setSource('')
            setId('')
            setDescription('')
          }

          return (
            <div>
              <div>
                <div className="flex items-end">
                  <div className="w-full max-w-[25rem] mr-2.5">
                    <LabelWithTooltip
                      label={'ROS'}
                      tooltip={
                        'Velg relevant kilde fra nedtrekksmenyen, og angi id til korrekt ROS.'
                      }
                    />
                    <Select
                      label="Hvor er ROS lagret"
                      hideLabel
                      onChange={(event) => {
                        setSource(event.target.value)
                      }}
                      value={source}
                    >
                      <option value="">Velg kilde</option>
                      <option value="TryggNok">TryggNok</option>
                      <option value="Websak">Websak</option>
                    </Select>

                  </div>
                  <div className="w-full">
                    <LabelWithTooltip
                      label="ID"
                      tooltip="Identifikator som viser til riktig ROS i det valgte systemet."
                    />
                    <TextField
                      className="max-w-[25rem] mr-2.5"
                      label="ID"
                      hideLabel
                      value={id}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setId((event.target as HTMLInputElement).value)
                      }
                    />

                  </div>
                  <TextField
                    className="w-full"
                    label="Beskrivelse"
                    value={description}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setDescription((event.target as HTMLInputElement).value)}
                  />
                  <div className="min-w-[6.688rem] ml-2.5">
                    <Button type="button" onClick={add} variant="secondary">
                      Legg til
                    </Button>
                  </div>
                </div>
                {error && <Error message={error}/>}
                {!error && <FormError fieldName="ros" akselStyling/>}
                {!!source && id && (
                  <div className="flex items-center mt-2.5">
                    <Label className="mr-6">Forhåndsvisning: </Label>
                    {source}{id} {description}
                  </div>
                )}
              </div>

              {/*              <RenderTagList
                list={fieldArrayRenderProps.form.values.regelverk.map((regelverk: IRegelverk) => (
                  <LovView regelverk={regelverk} key={regelverk.lov.code}/>
                ))}
                onRemove={fieldArrayRenderProps.remove}
              />*/}
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
