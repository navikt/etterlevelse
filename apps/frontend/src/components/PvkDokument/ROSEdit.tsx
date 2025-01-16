import { Button, Heading, TextField } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { ChangeEvent, useState } from 'react'
import { FieldWrapper } from '../common/Inputs'
import { Error, FormError } from '../common/ModalSchema'
import { RenderTagList } from '../common/TagList'

const linkReg = /\[(.+)]\((.+)\)/i
const linkNameFor = (t: string) => {
  const groups = t.match(linkReg)
  if (groups) return groups[1]
  return t
}

export const ROSEdit = () => {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  return (
    <FieldWrapper marginBottom id="risikovurderinger">
      <FieldArray name="risikovurderinger">
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
            fieldArrayRenderProps.push(`[${name}](${url})`)
            setError('')
            setUrl('')
            setName('')
          }

          return (
            <div className="my-8">
              <Heading level="2" size="small" spacing>
                Legg til informasjon on gjeldende ROS-dokumentasjon
              </Heading>

              <div className="flex">
                <TextField
                  className="w-full"
                  label="Legg inn URL til ROS-dokumentasjon"
                  value={url}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setUrl((event.target as HTMLInputElement).value)
                  }
                />
                <TextField
                  className="w-full mx-2.5"
                  label="Legg inn navnet til ROS-dokumentet"
                  value={name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setName((event.target as HTMLInputElement).value)
                  }
                />
                <div className="flex items-end">
                  <Button
                    className="min-w-[6.688rem] "
                    type="button"
                    onClick={add}
                    variant="secondary"
                  >
                    Legg til
                  </Button>
                </div>
              </div>

              {error && <Error message={error} />}
              {!error && <FormError fieldName="risikovurderinger" akselStyling />}

              <RenderTagList
                list={(fieldArrayRenderProps.form.values.risikovurderinger as string[]).map(
                  linkNameFor
                )}
                onRemove={fieldArrayRenderProps.remove}
              />
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
