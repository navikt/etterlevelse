import { Detail } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { ReactNode } from 'react'
import Select, { CSSObjectWithLabel } from 'react-select'
import { TOr } from '../../../constants'
import { EListName, ICode, codelist } from '../../../services/Codelist'
import { ettlevColors } from '../../../util/theme'
import { FieldWrapper } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'

export const EditKravMultiOptionField = (
  props: {
    label: string
    name: string
    caption?: ReactNode
    tooltip?: string
    marginBottom?: boolean
  } & TOr<
    { options: { value: string; label: string; description: string }[] },
    { listName: EListName }
  >
) => {
  const options = props.options || codelist.getParsedOptions(props.listName)

  return (
    <FieldWrapper marginBottom={props.marginBottom}>
      <FieldArray name={props.name}>
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          const selectedIds = (fieldArrayRenderProps.form.values[props.name] as any[]).map(
            (value) => (props.listName ? (value as ICode).code : value)
          )
          return (
            <div>
              <LabelWithTooltip label={props.label} tooltip={props.tooltip} />
              {props.caption && <Detail>{props.caption}</Detail>}
              <Select
                isMulti
                options={options}
                value={selectedIds.map((value) => options.find((option) => option.value === value))}
                onChange={(value) => {
                  if (value.length) {
                    if (props.listName) {
                      fieldArrayRenderProps.form.setFieldValue(
                        props.name,
                        value.map((value) => codelist.getCode(props.listName, value?.value))
                      )
                    } else {
                      fieldArrayRenderProps.form.setFieldValue(
                        props.name,
                        value.map((value) => value?.value)
                      )
                    }
                  } else {
                    fieldArrayRenderProps.form.setFieldValue(props.name, [])
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
