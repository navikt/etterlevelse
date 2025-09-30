'use client'

import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { Error, FormError } from '@/components/common/modalSchema/formError/formError'
import { TrashIcon } from '@navikt/aksel-icons'
import { Button, Heading, Table, TextField } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { ChangeEvent, useState } from 'react'

export const ROSEdit = () => {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  return (
    <FieldWrapper marginBottom id='risikovurderinger'>
      <FieldArray name='risikovurderinger'>
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          const add = (): void => {
            if (name == '') {
              setError('Legg til et navn')
              return
            }
            if (url == '') {
              setError('Du må legge til en URL')
              return
            }
            if (!url.match(/https?:\/\//i)) {
              setError('Dette ser ikke ut som en gyldig URL')
              return
            }
            fieldArrayRenderProps.insert(0, `[${name}](${url})`)
            setError('')
            setUrl('')
            setName('')
          }

          return (
            <div className='my-8'>
              <Heading level='2' size='small' spacing>
                Legg til annen aktuell dokumentasjon. ROS som er aktuell(e), skal dere legge til
                her.
              </Heading>

              <div className='w-full my-2.5'>
                <TextField
                  className='w-full'
                  label='Legg inn navnet på dokumentet'
                  value={name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setName((event.target as HTMLInputElement).value)
                  }
                />
                <TextField
                  className='w-full my-2.5'
                  label='Legg inn lenken (URL) som peker til dokumentet i TryggNok, Sharepoint eller Public 360'
                  value={url}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setUrl((event.target as HTMLInputElement).value)
                  }
                />
              </div>

              {error && <Error message={error} />}
              {!error && <FormError fieldName='risikovurderinger' akselStyling />}

              <Table className='mt-2.5 w-3/5' size='small'>
                <Table.Body>
                  {fieldArrayRenderProps.form.values.risikovurderinger &&
                    fieldArrayRenderProps.form.values.risikovurderinger.map(
                      (ros: string, index: number) => {
                        const rosReg: RegExp = /\[(.+)]\((.+)\)/i
                        const rosParts: RegExpMatchArray | null = ros.match(rosReg)

                        if (rosParts)
                          return (
                            <Table.Row key={ros}>
                              <Table.DataCell>
                                <ExternalLink key={ros} href={rosParts[2]}>
                                  {rosParts[1]}
                                </ExternalLink>
                              </Table.DataCell>
                              <Table.DataCell className='flex justify-end'>
                                <Button
                                  type='button'
                                  variant='tertiary'
                                  icon={<TrashIcon aria-hidden aria-label='' />}
                                  onClick={() => fieldArrayRenderProps.remove(index)}
                                >
                                  Slett lenke
                                </Button>
                              </Table.DataCell>
                            </Table.Row>
                          )
                        return (
                          <span className='flex' key={ros}>
                            {ros}
                          </span>
                        )
                      }
                    )}
                </Table.Body>
              </Table>

              <Button
                className='min-w-[6.688rem] my-2.5 items-end'
                type='button'
                onClick={add}
                variant='secondary'
              >
                Legg til
              </Button>
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}

export default ROSEdit
