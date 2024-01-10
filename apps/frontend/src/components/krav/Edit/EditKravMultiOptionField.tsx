import { Detail } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { ReactNode } from 'react'
import Select, { CSSObjectWithLabel } from 'react-select'
import { TOr } from '../../../constants'
import { EListName, ICode, codelist } from '../../../services/Codelist'
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
        {(p: FieldArrayRenderProps) => {
          const selectedIds = (p.form.values[props.name] as any[]).map((v) =>
            props.listName ? (v as ICode).code : v
          )
          return (
            <div>
              <LabelWithTooltip label={props.label} tooltip={props.tooltip} />
              {props.caption && <Detail>{props.caption}</Detail>}
              <Select
                isMulti
                options={options}
                value={selectedIds.map((v) => options.find((o) => o.value === v))}
                onChange={(value) => {
                  if (value.length) {
                    if (props.listName) {
                      p.form.setFieldValue(
                        props.name,
                        value.map((v) => codelist.getCode(props.listName, v?.value))
                      )
                    } else {
                      p.form.setFieldValue(
                        props.name,
                        value.map((v) => v?.value)
                      )
                    }
                  } else {
                    p.form.setFieldValue(props.name, [])
                  }
                }}
                styles={{
                  control: (baseStyles) =>
                    ({
                      ...baseStyles,
                      minHeight: '48px',
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
