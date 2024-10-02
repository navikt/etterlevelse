import { Button, Modal } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import Select, { CSSObjectWithLabel, SingleValue } from 'react-select'
import * as yup from 'yup'
import {
  createVirkemiddel,
  updateVirkemiddel,
  virkemiddelMapToFormVal,
} from '../../../api/VirkemiddelApi'
import { EYupErrorMessage, IVirkemiddel } from '../../../constants'
import { CodelistService, EListName, IGetParsedOptionsProps } from '../../../services/Codelist'
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
  const { isOpen, setIsOpen, virkemiddel, setVirkemiddel, isEdit, refetchData } = props
  const [codelistUtils] = CodelistService()
  const virkemiddelTypeOptions: IGetParsedOptionsProps[] = codelistUtils.getParsedOptions(
    EListName.VIRKEMIDDELTYPE
  )
  const [valgtVirkemiddeltype, setValgtVirkemiddeltype] = useState<{
    value: string
    label: string
  }>({ value: '', label: '' })

  useEffect(() => {
    if (virkemiddel && virkemiddel.virkemiddelType) {
      setValgtVirkemiddeltype({
        value: virkemiddel.virkemiddelType.code,
        label: virkemiddel.virkemiddelType.shortName,
      })
    }
  }, [virkemiddel])

  const submit = async (virkemiddel: IVirkemiddel): Promise<void> => {
    if (!virkemiddel.id || virkemiddel.id === 'ny') {
      await createVirkemiddel(virkemiddel).then((response: IVirkemiddel) => {
        setIsOpen(false)
        if (setVirkemiddel) {
          setVirkemiddel(response)
        } else if (refetchData) {
          refetchData()
        }
      })
    } else {
      await updateVirkemiddel(virkemiddel).then((response: IVirkemiddel) => {
        setIsOpen(false)
        if (setVirkemiddel) {
          setVirkemiddel(response)
        } else if (refetchData) {
          refetchData()
        }
      })
    }
  }

  return (
    <div>
      <Modal
        width="6.25rem"
        open={!!isOpen}
        onClose={() => setIsOpen(false)}
        header={{
          heading: isEdit ? 'Rediger virkemiddel' : 'Opprett nytt virkemiddel',
          closeButton: false,
        }}
      >
        <Modal.Body>
          <Formik
            validationSchema={createVirkemiddelSchema()}
            initialValues={virkemiddelMapToFormVal(virkemiddel ? virkemiddel : {})}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={submit}
          >
            {({ submitForm }) => (
              <Form>
                <InputField label="Navn" name="navn" />
                <FieldWrapper>
                  <Field name="virkemiddelType">
                    {(fieldProps: FieldProps) => (
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
                          onChange={(
                            value: SingleValue<{
                              value: string
                              label: string
                            }>
                          ) => {
                            if (value) {
                              setValgtVirkemiddeltype(value)
                              fieldProps.form.setFieldValue('virkemiddelType', value.value)
                            }
                          }}
                          styles={{
                            control: (baseStyles) =>
                              ({
                                ...baseStyles,
                                height: '3rem',
                                borderColor: fieldProps.form.errors.virkemiddelType
                                  ? ettlevColors.red500
                                  : ettlevColors.textAreaBorder,
                                ...borderWidth(
                                  fieldProps.form.errors.virkemiddelType ? '0.125rem' : '0.063rem'
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
                  <Button variant="secondary" type="button" onClick={() => setIsOpen(false)}>
                    Avbryt
                  </Button>

                  <Button
                    className="ml-2"
                    type="button"
                    onClick={() => {
                      submitForm()
                    }}
                  >
                    {isEdit ? 'Lagre' : 'Opprett'}
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
