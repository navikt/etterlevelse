import { BodyLong, Button, ErrorSummary, Heading, ReadMore, TextField } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import _ from 'lodash'
import { ChangeEvent, RefObject, useEffect, useRef, useState } from 'react'
import AsyncSelect from 'react-select/async'
import { searchResourceByNameOptions, useSearchTeamOptions } from '../../../api/TeamApi'
import { mapTiltakToFormValue } from '../../../api/TiltakApi'
import { ITiltak } from '../../../constants'
import { isDev } from '../../../util/config'
import { DateField, InputField, TextAreaField } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { FormError } from '../../common/ModalSchema'
import { RenderTagList } from '../../common/TagList'
import { DropdownIndicator } from '../../krav/Edit/KravBegreperEdit'
import { noOptionMessage, selectOverrides } from '../../search/util'
import { tiltakSchemaValidation } from './tiltakSchema'

interface IProps {
  title?: string
  initialValues: ITiltak
  pvkDokumentId: string
  submit: (tiltak: ITiltak) => void
  close: () => void
  formRef?: RefObject<any>
}

export const TiltakForm = (props: IProps) => {
  const { title, initialValues, pvkDokumentId, submit, close, formRef } = props
  const [customPersonForDev, setCustomPersonForDev] = useState<string>('')

  const [validateOnBlur, setValidateOnBlur] = useState(false)
  const [submitClick, setSubmitClick] = useState<boolean>(false)
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!_.isEmpty(formRef?.current.errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [submitClick])

  useEffect(() => {
    const formHeader = document.getElementById('tiltakFormHeader')
    if (formHeader) {
      formHeader.scrollIntoView()
    }
  }, [])

  return (
    <Formik
      initialValues={mapTiltakToFormValue({
        ...initialValues,
        pvkDokumentId: pvkDokumentId,
      })}
      validateOnBlur={false}
      validateOnChange={validateOnBlur}
      validationSchema={tiltakSchemaValidation()}
      onSubmit={submit}
      innerRef={formRef}
    >
      {({ values, resetForm, submitForm, errors }) => (
        <Form>
          {title && (
            <div className='mb-5 border-t-2 mt-5'>
              <Heading size='medium' className='mt-5' id='tiltakFormHeader'>
                {title}
              </Heading>
            </div>
          )}

          <InputField
            marginBottom
            label='Navngi tiltaket'
            description='Velg et navn som lett kan skilles fra andre tiltak dere oppretter'
            name='navn'
            disablePlaceHolder
          />

          <TextAreaField
            label='Beskriv tiltaket nærmere'
            name='beskrivelse'
            rows={3}
            noPlaceholder
            marginBottom
          />

          <Heading level='2' size='small' spacing>
            Legg til minst et team og/eller en person
          </Heading>

          <Field name='ansvarligTeam'>
            {(fieldRenderProps: FieldProps) => (
              <div className='flex-1'>
                <LabelWithTooltip label='Søk team fra Teamkatalogen' tooltip='' />
                <div className='w-full'>
                  <AsyncSelect
                    aria-label='Søk etter team'
                    placeholder=''
                    components={{ DropdownIndicator }}
                    noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                    controlShouldRenderValue={false}
                    loadingMessage={() => 'Søker...'}
                    isClearable={false}
                    loadOptions={useSearchTeamOptions}
                    onChange={(value: any) => {
                      if (value && fieldRenderProps.form.values.ansvarligTeam.id !== value.id) {
                        fieldRenderProps.form.setFieldValue('ansvarligTeam', value)
                      }
                    }}
                    styles={selectOverrides}
                  />
                </div>
                <RenderTagList
                  list={[fieldRenderProps.form.values.ansvarligTeam.name]}
                  onRemove={() => {
                    fieldRenderProps.form.setFieldValue('ansvarligTeam', {})
                  }}
                />
              </div>
            )}
          </Field>

          <Field name='ansvarlig'>
            {(fieldRenderProps: FieldProps) => (
              <div className='mb-5'>
                <LabelWithTooltip label='Hvem er tiltaksansvarlig?' tooltip='' />
                <BodyLong>Søk etter person</BodyLong>
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
                        fieldRenderProps.form.values.ansvarlig.navIdent !== value.navIdent
                      ) {
                        fieldRenderProps.form.setFieldValue('ansvarlig', value)
                      }
                    }}
                    styles={selectOverrides}
                  />
                  <RenderTagList
                    list={[fieldRenderProps.form.values.ansvarlig.fullName]}
                    onRemove={() => {
                      fieldRenderProps.form.setFieldValue('ansvarlig', {})
                    }}
                  />
                </div>

                {isDev && (
                  <ReadMore header='Hva hvis jeg ikke finner person'>
                    <div className='flex gap-2 items-end my-2'>
                      <TextField
                        label='Skriv inn Nav ident dersom du ikke finner person over'
                        value={customPersonForDev}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setCustomPersonForDev(event.target.value)
                        }
                      />
                      <div>
                        <Button
                          type='button'
                          onClick={() => {
                            fieldRenderProps.form.setFieldValue('ansvarlig', {
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
                      list={[fieldRenderProps.form.values.ansvarlig.fullName]}
                      onRemove={() => {
                        fieldRenderProps.form.setFieldValue('ansvarlig', {})
                      }}
                    />
                  </ReadMore>
                )}
              </div>
            )}
          </Field>

          <div className='mb-5'>
            <DateField label='Legg inn tiltaksfrist' name='frist' />
            <FormError fieldName='frist' akselStyling />
          </div>

          {Object.values(errors).some(Boolean) && (
            <ErrorSummary
              ref={errorSummaryRef}
              heading='Du må rette disse feilene før du kan fortsette'
            >
              {Object.entries(errors)
                .filter(([, error]) => error)
                .map(([key, error]) => (
                  <ErrorSummary.Item href={`#${key}`} key={key}>
                    {error as string}
                  </ErrorSummary.Item>
                ))}
            </ErrorSummary>
          )}

          <div className='flex gap-2 mt-5'>
            <Button
              type='button'
              onClick={async () => {
                setValidateOnBlur(true)
                await submitForm()
                setSubmitClick(!submitClick)
              }}
            >
              Lagre tiltak
            </Button>
            <Button
              type='button'
              variant='secondary'
              onClick={() => {
                resetForm({ values })
                close()
              }}
            >
              Avbryt
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default TiltakForm
