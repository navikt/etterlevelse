import { Button, Detail, Label, ReadMore, TextField } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { ChangeEvent, RefObject, useState } from 'react'
import AsyncSelect from 'react-select/async'
import { searchResourceByNameOptions } from '../../../api/TeamApi'
import { mapTiltakToFormValue } from '../../../api/TiltakApi'
import { ITiltak } from '../../../constants'
import { isDev } from '../../../util/config'
import { DateField, InputField, TextAreaField } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { RenderTagList } from '../../common/TagList'
import { DropdownIndicator } from '../../krav/Edit/KravBegreperEdit'
import { noOptionMessage, selectOverrides } from '../../search/util'

interface IProps {
  title: string
  initialValues: ITiltak
  pvkDokumentId: string
  submit: (tiltak: ITiltak) => void
  formRef: RefObject<any>
  size?: 'medium' | 'small' | 'xsmall'
}

export const TiltakForm = (props: IProps) => {
  const { title, initialValues, pvkDokumentId, submit, formRef, size } = props
  const [customPersonForDev, setCustomPersonForDev] = useState<string>('')

  return (
    <Formik
      initialValues={mapTiltakToFormValue({ ...initialValues, pvkDokumentId: pvkDokumentId })}
      onSubmit={submit}
      innerRef={formRef}
    >
      {({ values, resetForm, submitForm }) => (
        <Form>
          <div className="mb-5">
            <Label>{title}</Label>
          </div>

          <InputField
            marginBottom
            label="Navngi tiltaket"
            description="Velg et navn som lett kan skilles fra andre tiltak dere oppretter"
            name="navn"
            disablePlaceHolder
          />

          <TextAreaField
            label="Beskriv tiltaket nærmere (valgfritt)"
            name="beskrivelse"
            rows={3}
            noPlaceholder
            marginBottom
          />

          <Field name="ansvarlig">
            {(fieldRenderProps: FieldProps) => (
              <div className="mb-5">
                <LabelWithTooltip label="Hvem er tiltaksansvarlig?" tooltip="" />
                <Detail>Skriv for eksempel teamnavn, rolle(r), eller lignende.</Detail>
                <div className="w-full">
                  <AsyncSelect
                    aria-label="Søk etter person"
                    placeholder=""
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
                  <ReadMore header="Hva hvis jeg ikke finner person">
                    <div className="flex gap-2 items-end my-2">
                      <TextField
                        label="Skriv inn NAV ident dersom du ikke finner person over"
                        value={customPersonForDev}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setCustomPersonForDev(event.target.value)
                        }
                      />
                      <div>
                        <Button
                          type="button"
                          size={size ? size : 'medium'}
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

          <div className="mb-5">
            <DateField label="Legg inn tiltaksfrist" name="frist" />
          </div>

          <div className="flex gap-2 mt-5">
            <Button size={size ? size : 'medium'} type="button" onClick={() => submitForm()}>
              Lagre
            </Button>
            <Button
              type="button"
              size={size ? size : 'medium'}
              variant="secondary"
              onClick={() => resetForm({ values })}
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
