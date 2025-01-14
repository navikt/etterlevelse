import {Button, TextField, Heading} from '@navikt/ds-react'
import {FieldArray, FieldArrayRenderProps} from 'formik'
import {ChangeEvent, useState} from 'react'
//import {IRegelverk} from '../../constants'
//import {LovView} from '../Lov'
import {FieldWrapper} from '../common/Inputs'
import {Error, FormError} from '../common/ModalSchema'
//import {RenderTagList} from '../common/TagList'

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
              <div>
                <div className="flex items-end">
                  <div className="w-full max-w-[25rem] mr-2.5">
                    <Heading level="2" size="small" spacing>
                      Legg til informasjon on gjeldende ROS-dokumentasjon
                    </Heading>
                  </div>
                  <div className="w-full">
                    <TextField
                      className="max-w-[25rem] mr-2.5"
                      label="Legg inn URL til ROS-dokumentasjon"
                      value={url}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setUrl((event.target as HTMLInputElement).value)
                      }
                    />

                  </div>
                  <TextField
                    className="w-full"
                    label="Legg inn navnet til ROS-dokumentet"
                    value={name}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setName((event.target as HTMLInputElement).value)}
                  />
                  <div className="min-w-[6.688rem] ml-2.5">
                    <Button type="button" onClick={add} variant="secondary">
                      Legg til
                    </Button>
                  </div>
                </div>
                {error && <Error message={error}/>}
                {!error && <FormError fieldName="ros" akselStyling/>}

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
