import { PencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { Button, Heading, Table, TextField } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { ChangeEvent, useState } from 'react'
import { FieldWrapper } from '../common/Inputs'
import { Error, FormError } from '../common/ModalSchema'
import { ExternalLink } from '../common/RouteLink'

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
                  label="Legg inn navnet til ROS-dokumentet"
                  value={name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setName((event.target as HTMLInputElement).value)
                  }
                />
                <TextField
                  className="w-full mx-2.5"
                  label="Legg inn URL til ROS-dokumentasjon"
                  value={url}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setUrl((event.target as HTMLInputElement).value)
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

              <Table className="mt-2.5" size="small">
                <Table.Body>
                  {fieldArrayRenderProps.form.values.risikovurderinger
                    ? fieldArrayRenderProps.form.values.risikovurderinger.map(
                        (vurdering: string, index: number) => {
                          const linkReg = /\[(.+)]\((.+)\)/i
                          const groups = vurdering.match(linkReg)
                          if (groups)
                            return (
                              <Table.Row key={vurdering}>
                                <Table.DataCell>
                                  <ExternalLink key={vurdering} className="flex" href={groups[2]}>
                                    {groups[1]}
                                  </ExternalLink>
                                </Table.DataCell>
                                <Table.DataCell>
                                  <Button
                                    variant="tertiary"
                                    icon={<PencilIcon aria-hidden aria-label="" />}
                                  >
                                    Redigér lenke
                                  </Button>
                                </Table.DataCell>
                                <Table.DataCell>
                                  <Button
                                    variant="tertiary"
                                    icon={<TrashIcon aria-hidden aria-label="" />}
                                    onClick={() => fieldArrayRenderProps.remove(index)}
                                  >
                                    Slett lenke
                                  </Button>
                                </Table.DataCell>
                              </Table.Row>
                            )
                          return (
                            <span className="flex" key={vurdering}>
                              {vurdering}
                            </span>
                          )
                        }
                      )
                    : 'Ikke angitt'}
                </Table.Body>
              </Table>
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
