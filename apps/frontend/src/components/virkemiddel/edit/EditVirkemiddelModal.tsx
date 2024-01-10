import { Block } from 'baseui/block'
import { FormControl } from 'baseui/form-control'
import { ModalBody, ModalHeader } from 'baseui/modal'
import { Value } from 'baseui/select'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import * as yup from 'yup'
import { createVirkemiddel, updateVirkemiddel, virkemiddelMapToFormVal } from '../../../api/VirkemiddelApi'
import { IVirkemiddel } from '../../../constants'
import { EListName, codelist } from '../../../services/Codelist'
import { intl } from '../../../util/intl/intl'
import { ettlevColors } from '../../../util/theme'
import Button from '../../common/Button'
import CustomizedModal from '../../common/CustomizedModal'
import CustomizedSelect from '../../common/CustomizedSelect'
import { FieldWrapper, InputField } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { borderColor, borderWidth } from '../../common/Style'
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
  const [valgtVirkemiddeltype, setValgtVirkemiddeltype] = useState<Value>([])

  useEffect(() => {
    if (props.virkemiddel && props.virkemiddel.virkemiddelType) {
      setValgtVirkemiddeltype([
        {
          id: props.virkemiddel.virkemiddelType.code,
          label: props.virkemiddel.virkemiddelType.shortName,
        },
      ])
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
    <Block>
      <CustomizedModal size="default" isOpen={!!props.isOpen} onClose={() => props.setIsOpen(false)}>
        <ModalHeader>{props.isEdit ? 'Rediger virkemiddel' : 'Opprett nytt virkemiddel'}</ModalHeader>
        <ModalBody>
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
                          <FormControl label={<LabelWithTooltip label="Legg til virkemiddeltype" tooltip="Søk og legg til virkemiddeltype fra kodeverket" />}>
                            <Block width="100%" maxWidth="400px">
                              <CustomizedSelect
                                overrides={{
                                  ControlContainer: {
                                    style: {
                                      backgroundColor: fp.form.errors.virkemiddelType ? ettlevColors.error50 : ettlevColors.white,
                                      ...borderColor(fp.form.errors.virkemiddelType ? ettlevColors.red600 : ettlevColors.grey200),
                                      ...borderWidth('2px'),
                                    },
                                  },
                                }}
                                noResultsMsg={intl.emptyTable}
                                maxDropdownHeight="350px"
                                searchable={true}
                                options={virkemiddelTypeOptions}
                                placeholder={'Velg virkemiddeltype'}
                                aria-label={'Velg virkemiddeltype'}
                                value={valgtVirkemiddeltype}
                                onChange={({ value }) => {
                                  setValgtVirkemiddeltype(value)
                                  fp.form.setFieldValue('virkemiddelType', value && value.length ? value[0].id : undefined)
                                }}
                              />
                            </Block>
                          </FormControl>
                        )
                      }}
                    </Field>
                    {errors.virkemiddelType && <ErrorMessageModal msg={errors.virkemiddelType} fullWidth={true} />}
                  </FieldWrapper>

                  <RegelverkEdit forVirkemiddel />
                  {errors.regelverk && <ErrorMessageModal msg={errors.regelverk} fullWidth={true} />}
                  <Block display="flex" justifyContent="flex-end">
                    <Button kind="secondary" type="button" onClick={() => props.setIsOpen(false)}>
                      Avbryt
                    </Button>

                    <Button
                      marginLeft={true}
                      type="button"
                      onClick={() => {
                        submitForm()
                      }}
                    >
                      {props.isEdit ? 'Lagre' : 'Opprett'}
                    </Button>
                  </Block>
                </Form>
              )
            }}
          </Formik>
        </ModalBody>
      </CustomizedModal>
    </Block>
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
