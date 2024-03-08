import { Button, Modal } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import Select, { CSSObjectWithLabel } from 'react-select'
import * as yup from 'yup'
import {
  createVirkemiddel,
  updateVirkemiddel,
  virkemiddelMapToFormVal,
} from '../../../api/VirkemiddelApi'
import { EYupErrorMessage, IVirkemiddel } from '../../../constants'
import { EListName, codelist } from '../../../services/Codelist'
import { ettlevColors } from '../../../util/theme'
import { FieldWrapper, InputField } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { FormError } from '../../common/ModalSchema'
import { borderWidth } from '../../common/Style'
import { RegelverkEdit } from '../../krav/Edit/RegelverkEdit'

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
        width="6.25rem"
        open={!!props.isOpen}
        onClose={() => props.setIsOpen(false)}
        header={{
          heading: props.isEdit ? 'Rediger virkemiddel' : 'Opprett nytt virkemiddel',
          closeButton: false,
        }}
      >
        <Modal.Body>
          <Formik
            validationSchema={createVirkemiddelSchema()}
            initialValues={virkemiddelMapToFormVal(props.virkemiddel ? props.virkemiddel : {})}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={submit}
          >
            {({ submitForm }) => (
              <Form>
                <InputField label={'Navn'} name={'navn'} />
                <FieldWrapper>
                  <Field name="virkemiddelType">
                    {(fp: FieldProps) => (
                      <div className="w-full max-w-[25rem]">
                        <LabelWithTooltip
                          label="Legg til virkemiddeltype"
                          tooltip="Søk og legg til virkemiddeltype fra kodeverket"
                        />
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
                                height: '3rem',
                                borderColor: fp.form.errors.virkemiddelType
                                  ? ettlevColors.red500
                                  : ettlevColors.textAreaBorder,
                                ...borderWidth(
                                  fp.form.errors.virkemiddelType ? '0.125rem' : '0.063rem'
                                ),
                              }) as CSSObjectWithLabel,
                            menu: (baseStyles) =>
                              ({
                                ...baseStyles,
                                zIndex: 2,
                              }) as CSSObjectWithLabel,
                          }}
                        />
                      </div>
                    )}
                  </Field>

                  <FormError fieldName="virkemiddelType" akselStyling />
                </FieldWrapper>

                <RegelverkEdit forVirkemiddel />
                <div className="flex justify-end">
                  <Button variant="secondary" type="button" onClick={() => props.setIsOpen(false)}>
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
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  )
}

const createVirkemiddelSchema = () =>
  yup.object({
    navn: yup.string().required(EYupErrorMessage.PAAKREVD),
    regelverk: yup.array().test({
      name: 'regelverkCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (regelverk) {
        return regelverk && regelverk.length > 0 ? true : false
      },
    }),
    virkemiddelType: yup.string().required(EYupErrorMessage.PAAKREVD),
  })
