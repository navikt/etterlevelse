import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import LabelWithToolTip from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { TOr } from '@/constants/commonConstants'
import { EListName, ICode } from '@/constants/kodeverk/kodeverkConstants'
import { codelist } from '@/services/kodeverk/kodeverkService'
import { ettlevColors } from '@/util/theme/theme'
import { BodyShort } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { ReactNode } from 'react'
import Select, { CSSObjectWithLabel } from 'react-select'

interface IKravEditMultiOptionFieldProps {
  label: string
  name: string
  caption?: ReactNode
  tooltip?: string
  marginBottom?: boolean
}

type TKravEditMultiOptionFieldTypes = TOr<
  { options: { value: string; label: string; description: string }[] },
  { listName: EListName }
>

export const KravEditMultiOptionField = (
  props: IKravEditMultiOptionFieldProps & TKravEditMultiOptionFieldTypes
) => {
  const { label, name, caption, tooltip, marginBottom } = props
  const options: {
    value: string
    label: string
    description: string
  }[] = props.options || codelist.getParsedOptions(props.listName)

  return (
    <FieldWrapper marginBottom={marginBottom}>
      <FieldArray name={name}>
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          const selectedIds = (fieldArrayRenderProps.form.values[name] as any[]).map(
            (value: any) => (props.listName ? (value as ICode).code : value)
          )
          return (
            <div>
              <LabelWithToolTip label={label} tooltip={tooltip} />
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
                          ) => codelist.getCode(props.listName, value?.value)
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
