import { Select as SelectBase, SelectOverrides, Value } from 'baseui/select'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import _ from 'lodash'
import { ReactNode } from 'react'
import { Or } from '../../../constants'
import { Code, codelist, ListName } from '../../../services/Codelist'
import { ettlevColors } from '../../../util/theme'
import { FieldWrapper } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { borderWidth } from '../../common/Style'
import { RenderTagList } from '../../common/TagList'
import { navChevronDownIcon } from '../../Images'
import { Detail } from '@navikt/ds-react'
import Select from 'react-select'

const customOverrides: SelectOverrides = {
  ControlContainer: {
    style: {
      ...borderWidth('1px'),
      ':hover': {
        backgroundColor: ettlevColors.green50,
      },
    },
  },
  SelectArrow: {
    component: ({ $isOpen }: { $isOpen: boolean }) =>
      $isOpen ? <img src={navChevronDownIcon} alt="Chevron opp" style={{ transform: 'rotate(180deg)' }} /> : <img src={navChevronDownIcon} alt="Chevron ned" />,
  },
  DropdownListItem: {
    style: {
      fontSize: '18px',
      marginTop: '4px',
      marginBottom: '4px',
    },
  },
}

export const EditKravMultiOptionField = (
  props: {
    label: string
    name: string
    caption?: ReactNode
    tooltip?: string
    marginBottom?: boolean
  } & Or<{ options: { value: string; label: string; description: string }[] }, { listName: ListName }>,
) => {
  const options = props.options || codelist.getParsedOptions(props.listName)

  return (
    <FieldWrapper marginBottom={props.marginBottom}>
      <FieldArray name={props.name}>
        {(p: FieldArrayRenderProps) => {
          const selectedIds = (p.form.values[props.name] as any[]).map((v) => (props.listName ? (v as Code).code : v))
          return (
            <div>
              {props.caption && <Detail>{props.caption}</Detail>}
              <SelectBase
                placeholder={'Velg ' + _.lowerFirst(props.label)}
                aria-label={'Velg ' + _.lowerFirst(props.label)}
                maxDropdownHeight="400px"
                options={options.filter((o) => selectedIds.indexOf(o.value) < 0)}
                onChange={({ value }) => {
                  value.length && p.push(props.listName ? codelist.getCode(props.listName, value[0].value as string) : value[0].value)
                }}
              />
              <LabelWithTooltip label={props.label} tooltip={props.tooltip} />
              <Select
                isMulti
                options={options}
                value={selectedIds.map((v) => options.find((o) => o.value === v))}
                onChange={(value) => {
                  console.log(value)
                  // if(value.length > 0) {
                  //   p.form.setFieldValue(props.name, value.map((v) => v ? v.value : v))
                  // } else {
                  //   p.form.setFieldValue(props.name, [])
                  // }
                }}
              />

              <RenderTagList list={selectedIds.map((v) => options.find((o) => o.value === v)?.label)} onRemove={p.remove} wide />
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
