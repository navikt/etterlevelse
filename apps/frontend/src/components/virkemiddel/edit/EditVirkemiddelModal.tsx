import { Button, Modal } from '@navikt/ds-react'
import { FormControl } from 'baseui/form-control'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import Select, { CSSObjectWithLabel } from 'react-select'
import * as yup from 'yup'
import {
  createVirkemiddel,
  updateVirkemiddel,
  virkemiddelMapToFormVal,
} from '../../../api/VirkemiddelApi'
import { IVirkemiddel } from '../../../constants'
import { EListName, codelist } from '../../../services/Codelist'
import { FieldWrapper, InputField } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { RegelverkEdit } from '../../krav/Edit/RegelverkEdit'
import { ErrorMessageModal } from '../../krav/ErrorMessageModal'

const errorMessage = 'Feltet er påkrevd'

type TEditVirkemiddelModalProps = {
  isOpen: boolean
  setIsOpen: (b: boolean) => void
  virkemiddel?: IVirkemiddel
  setVirkemiddel?: (v: IVirkemiddel) => void
  isEdit?: boolean
  refetchData?: () => void
}

export const EditVirkemiddelModal = (props: TEditVirkemiddelModalProps) => {
  const virkemiddelTypeOptions = codelist.getParsedOptions(EListName.VIRKEMIDDELTYPE)
  const [valgtVirkemiddeltype, setValgtVirkemiddeltype] = useState<{
    value: string
    label: string
  }>({ value: '', label: '' })

  useEffect(() => {
    if (props.virkemiddel && props.virkemiddel.virkemiddelType) {
      setValgtVirkemiddeltype({
        value: props.virkemiddel.virkemiddelType.code,
        label: props.virkemiddel.virkemiddelType.shortName,
      })
    }
  }, [props.virkemiddel])

  const submit = async (virkemiddel: IVirkemiddel) => {
    if (!virkemiddel.id || virkemiddel.id === 'ny') {
      await createVirkemiddel(virkemiddel).then((response) => {
        props.setIsOpen(false)
        if (props.setVirkemiddel) {
          props.setVirkemiddel(response)
        } else if (props.refetchData) {
          props.refetchData()
        }
      })
    } else {
      await updateVirkemiddel(virkemiddel).then((response) => {
        props.setIsOpen(false)
        if (props.setVirkemiddel) {
          props.setVirkemiddel(response)
        } else if (props.refetchData) {
          props.refetchData()
        }
      })
    }
  }

  return (
    <div>
      <Modal
        width="1000px"
        open={!!props.isOpen}
        onClose={() => props.setIsOpen(false)}
        header={{ heading: props.isEdit ? 'Rediger virkemiddel' : 'Opprett nytt virkemiddel' }}
      >
        <Modal.Body>
          <Formik
            validationSchema={createVirkemiddelSchema()}
            initialValues={virkemiddelMapToFormVal(props.virkemiddel ? props.virkemiddel : {})}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={submit}
          >
            {({ submitForm, errors }) => {
              return (
                <Form>
                  <InputField label={'Navn'} name={'navn'} />
                  <FieldWrapper>
                    <Field name="virkemiddelType">
                      {(fp: FieldProps) => {
                        return (
                          <FormControl
                            label={
                              <LabelWithTooltip
                                label="Legg til virkemiddeltype"
                                tooltip="Søk og legg til virkemiddeltype fra kodeverket"
                              />
                            }
                          >
                            <div className="w-full max-w-[400px]">
                              <Select
                                options={virkemiddelTypeOptions}
                                placeholder="Velg virkemiddeltype"
                                aria-label="Velg virkemiddeltype"
                                value={valgtVirkemiddeltype}
                                onChange={(value) => {
                                  if (value) {
                                    setValgtVirkemiddeltype(value)
                                    fp.form.setFieldValue('virkemiddelType', value.value)
                                  }
                                }}
                                styles={{
                                  control: (baseStyles) =>
                                    ({
                                      ...baseStyles,
                                      height: '48px',
                                    }) as CSSObjectWithLabel,
                                  menu: (baseStyles) =>
                                    ({
                                      ...baseStyles,
                                      zIndex: 2,
                                    }) as CSSObjectWithLabel,
                                }}
                              />
                            </div>
                          </FormControl>
                        )
                      }}
                    </Field>
                    {errors.virkemiddelType && (
                      <ErrorMessageModal msg={errors.virkemiddelType} fullWidth={true} />
                    )}
                  </FieldWrapper>

                  <RegelverkEdit forVirkemiddel />
                  {errors.regelverk && (
                    <ErrorMessageModal msg={errors.regelverk} fullWidth={true} />
                  )}
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => props.setIsOpen(false)}
                    >
                      Avbryt
                    </Button>

                    <Button
                      className="ml-2"
                      type="button"
                      onClick={() => {
                        submitForm()
                      }}
                    >
                      {props.isEdit ? 'Lagre' : 'Opprett'}
                    </Button>
                  </div>
                </Form>
              )
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  )
}

const createVirkemiddelSchema = () =>
  yup.object({
    navn: yup.string().required(errorMessage),
    regelverk: yup.array().test({
      name: 'regelverkCheck',
      message: errorMessage,
      test: function (regelverk) {
        return regelverk && regelverk.length > 0 ? true : false
      },
    }),
    virkemiddelType: yup.string().required(errorMessage),
  })
