import { BodyShort } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { ReactNode } from 'react'
import Select, { CSSObjectWithLabel } from 'react-select'
import { TOr } from '../../../constants'
import { CodelistService, EListName, ICode } from '../../../services/Codelist'
import { ettlevColors } from '../../../util/theme'
import { FieldWrapper } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'

interface IEditKravMultiOptionFieldProps {
  label: string
  name: string
  caption?: ReactNode
  tooltip?: string
  marginBottom?: boolean
}

type TEditKravMultiOptionFieldTypes = TOr<
  { options: { value: string; label: string; description: string }[] },
  { listName: EListName }
>

export const EditKravMultiOptionField = (
  props: IEditKravMultiOptionFieldProps & TEditKravMultiOptionFieldTypes
) => {
  const { label, name, caption, tooltip, marginBottom } = props
  const [codelistUtils] = CodelistService()
  const options: {
    value: string
    label: string
    description: string
  }[] = props.options || codelistUtils.getParsedOptions(props.listName)

  return (
    <FieldWrapper marginBottom={marginBottom}>
      <FieldArray name={name}>
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          const selectedIds = (fieldArrayRenderProps.form.values[name] as any[]).map(
            (value: any) => (props.listName ? (value as ICode).code : value)
          )
          return (
            <div>
              <LabelWithTooltip label={label} tooltip={tooltip} />
              {caption && <BodyShort className='text-[var(--a-text-subtle)]'>{caption}</BodyShort>}
              <Select
                aria-label={label}
                isMulti
                options={options}
                value={selectedIds.map((value: any) =>
                  options.find(
                    (option: { value: string; label: string; description: string }) =>
                      option.value === value
                  )
                )}
                onChange={(value) => {
                  if (value.length) {
                    if (props.listName) {
                      fieldArrayRenderProps.form.setFieldValue(
                        name,
                        value.map(
                          (
                            value:
                              | {
                                  value: string
                                  label: string
                                  description: string
                                }
                              | undefined
                          ) => codelistUtils.getCode(props.listName, value?.value)
                        )
                      )
                    } else {
                      fieldArrayRenderProps.form.setFieldValue(
                        name,
                        value.map(
                          (
                            value:
                              | {
                                  value: string
                                  label: string
                                  description: string
                                }
                              | undefined
                          ) => value?.value
                        )
                      )
                    }
                  } else {
                    fieldArrayRenderProps.form.setFieldValue(name, [])
                  }
                }}
                styles={{
                  control: (baseStyles) =>
                    ({
                      ...baseStyles,
                      minHeight: '3rem',
                      borderColor: ettlevColors.textAreaBorder,
                    }) as CSSObjectWithLabel,
                }}
              />
              {/* <RenderTagList list={selectedIds.map((v) => options.find((o) => o.value === v)?.label)} onRemove={p.remove} /> */}
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
