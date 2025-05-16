import { Button, Checkbox, CheckboxGroup, Heading, ReadMore, TextField } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Field, FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik'
import { ChangeEvent, FunctionComponent, RefObject, useState } from 'react'
import AsyncSelect from 'react-select/async'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  updatePvoTilbakemelding,
} from '../../../api/PvoApi'
import { searchResourceByNameOptions } from '../../../api/TeamApi'
import { IPvoTilbakemelding, ITeamResource } from '../../../constants'
import { isDev } from '../../../util/config'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { RenderTagList } from '../../common/TagList'
import { DropdownIndicator } from '../../krav/Edit/KravBegreperEdit'
import { noOptionMessage, selectOverrides } from '../../search/util'

type TProps = {
  pvkDokumentId: string
  initialValue: IPvoTilbakemelding
  formRef: RefObject<any>
}

export const PvoTilbakemeldingAnsvarligForm: FunctionComponent<TProps> = ({
  pvkDokumentId,
  initialValue,
  formRef,
}) => {
  const [customPersonForDev, setCustomPersonForDev] = useState<string>('')

  const submit = async (pvoTilbakmelding: IPvoTilbakemelding): Promise<void> => {
    await getPvoTilbakemeldingByPvkDokumentId(pvkDokumentId)
      .then(async (response: IPvoTilbakemelding) => {
        if (response) {
          const updatedValues: IPvoTilbakemelding = {
            ...response,
            ansvarligData: pvoTilbakmelding.ansvarligData,
          }
          await updatePvoTilbakemelding(updatedValues).then(() => window.location.reload())
        }
      })
      .catch(async (error: AxiosError) => {
        if (error.status === 404) {
          const createValue = mapPvoTilbakemeldingToFormValue({
            pvkDokumentId: pvkDokumentId,
            ansvarligData: pvoTilbakmelding.ansvarligData,
          })
          await createPvoTilbakemelding(createValue).then(() => window.location.reload())
        } else {
          console.debug(error)
        }
      })
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={(values: IPvoTilbakemelding) => {
        submit(values)
      }}
      initialValues={initialValue}
      innerRef={formRef}
    >
      {({ submitForm, setFieldValue }) => (
        <Form>
          <div className='flex flex-col gap-2'>
            <Heading level='2' size='medium'>
              Legg til ansvarlig
            </Heading>
            <div id='ansvarligData' className='flex flex-col lg:flex-row gap-5 mb-5'>
              <FieldArray name='ansvarligData'>
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <div className='flex-1'>
                    <LabelWithTooltip label='Søk etter person' tooltip='' />
                    <div className='w-full'>
                      <AsyncSelect
                        aria-label='Søk etter person'
                        placeholder=''
                        components={{ DropdownIndicator }}
                        noOptionsMessage={({ inputValue }) => {
                          return noOptionMessage(inputValue)
                        }}
                        controlShouldRenderValue={false}
                        loadingMessage={() => 'Søker...'}
                        isClearable={false}
                        loadOptions={searchResourceByNameOptions}
                        onChange={(value: any) => {
                          if (
                            value &&
                            fieldArrayRenderProps.form.values.ansvarligData.filter(
                              (team: ITeamResource) => team.navIdent === value.navIdent
                            ).length === 0
                          ) {
                            fieldArrayRenderProps.push(value)
                          }
                        }}
                        styles={selectOverrides}
                      />
                      <RenderTagList
                        list={fieldArrayRenderProps.form.values.ansvarligData.map(
                          (resource: ITeamResource) => resource.fullName
                        )}
                        onRemove={fieldArrayRenderProps.remove}
                      />
                    </div>

                    {isDev && (
                      <ReadMore header='Hva hvis jeg ikke finner person'>
                        <div className='flex gap-2 items-end my-2'>
                          <TextField
                            label='Skriv inn NAV ident dersom du ikke finner person over'
                            value={customPersonForDev}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              setCustomPersonForDev(event.target.value)
                            }
                          />
                          <div>
                            <Button
                              type='button'
                              onClick={() => {
                                fieldArrayRenderProps.push({
                                  navIdent: customPersonForDev,
                                  givenName: customPersonForDev,
                                  familyName: customPersonForDev,
                                  fullName: customPersonForDev,
                                  email: customPersonForDev,
                                  resourceType: customPersonForDev,
                                })
                              }}
                            >
                              Legg til
                            </Button>
                          </div>
                        </div>
                        <RenderTagList
                          list={fieldArrayRenderProps.form.values.ansvarligData.map(
                            (resource: ITeamResource) => resource.fullName
                          )}
                          onRemove={fieldArrayRenderProps.remove}
                        />
                      </ReadMore>
                    )}
                  </div>
                )}
              </FieldArray>
              <div className='flex-1' />
            </div>

            <div id='avventerData' className='mb-5'>
              <Field name='avventer'>
                {() => (
                  <CheckboxGroup
                    legend='Sett status til avventer'
                    hideLegend
                    onChange={(value: string[]) => {
                      if (value.length !== 0) {
                        setFieldValue('avventer', true)
                      } else {
                        setFieldValue('avventer', false)
                      }
                    }}
                  >
                    <Checkbox value='isAvventer'>sett til avventer</Checkbox>
                  </CheckboxGroup>
                )}
              </Field>
            </div>

            <div className='flex gap-2'>
              <div>
                <Button size='small' type='button' onClick={submitForm}>
                  Lagre
                </Button>
              </div>
              <div>
                <Button
                  size='small'
                  type='button'
                  variant='secondary'
                  onClick={() => {
                    window.location.reload()
                  }}
                >
                  Forkast endringer
                </Button>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}
