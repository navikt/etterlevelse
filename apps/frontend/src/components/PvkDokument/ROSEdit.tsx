import {Button, TextField, Heading} from '@navikt/ds-react'
import {FieldArray, FieldArrayRenderProps} from 'formik'
import {ChangeEvent, useState} from 'react'
import {FieldWrapper} from '../common/Inputs'
import {Error, FormError} from '../common/ModalSchema'
import {RenderTagList} from '../common/TagList'

export const ROSEdit = () => {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  return (
    <FieldWrapper marginBottom id="ros">
      <FieldArray name="ros">
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          const add = (): void => {
            if (url === '') {
              setError('Du må legge til en URL')
              return
            }
            if (name === '') {
              setError('Legg til et navn')
              return
            }
            setError('')
            console.log("ROS link lagt til (TODO)", url, name)
            console.log(fieldArrayRenderProps.form.values)
            setUrl('')
            setName('')
          }

          return (
            <div>
              <Heading level="2" size="small" spacing>
                Legg til informasjon on gjeldende ROS-dokumentasjon
              </Heading>
              <div className="flex">
                <TextField
                  className="w-2/5"
                  label="Legg inn URL til ROS-dokumentasjon"
                  value={url}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setUrl((event.target as HTMLInputElement).value)
                  }
                />
                <TextField
                  className="w-2/5 mx-2.5"
                  label="Legg inn navnet til ROS-dokumentet"
                  value={name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setName((event.target as HTMLInputElement).value)}
                />
                <div className="flex items-end">
                  <Button type="button" onClick={add} variant="secondary">
                    Legg til
                  </Button>
                </div>
              </div>

              {error && <Error message={error}/>}
              {!error && <FormError fieldName="ros" akselStyling/>}

              <RenderTagList
                list={["ros-1", "ros-2"]}
                onRemove={fieldArrayRenderProps.remove}
              />
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
