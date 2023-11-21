import { Block } from 'baseui/block'
import { FormControl } from 'baseui/form-control'
import { Select, SelectOverrides, Value } from 'baseui/select'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import _ from 'lodash'
import { ReactNode } from 'react'
import { Or } from '../../../constants'
import { Code, codelist, ListName } from '../../../services/Codelist'
import { ettlevColors } from '../../../util/theme'
import { FieldWrapper } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { borderColor, borderWidth } from '../../common/Style'
import { RenderTagList } from '../../common/TagList'
import { navChevronDownIcon } from '../../Images'

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
    overrides?: SelectOverrides
  } & Or<{ options: Value }, { listName: ListName }>,
) => {
  const options: Value = props.options || codelist.getParsedOptions(props.listName)
  const overrides = _.merge(customOverrides, props.overrides)
  return (
    <FieldWrapper marginBottom={props.marginBottom}>
      <FieldArray name={props.name}>
        {(p: FieldArrayRenderProps) => {
          const selectedIds = (p.form.values[props.name] as any[]).map((v) => (props.listName ? (v as Code).code : v))
          return (
            <FormControl label={<LabelWithTooltip label={props.label} tooltip={props.tooltip} />} caption={props.caption}>
              <Block>
                <Block display="flex">
                  <Select
                    placeholder={'Velg ' + _.lowerFirst(props.label)}
                    aria-label={'Velg ' + _.lowerFirst(props.label)}
                    maxDropdownHeight="400px"
                    options={options.filter((o) => selectedIds.indexOf(o.id) < 0)}
                    onChange={({ value }) => {
                      value.length && p.push(props.listName ? codelist.getCode(props.listName, value[0].id as string) : value[0].id)
                    }}
                    overrides={{
                      ...overrides,
                      ControlContainer: {
                        style: {
                          backgroundColor: p.form.errors[props.name] && ettlevColors.error50,
                          ...borderColor(p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200),
                        },
                      },
                    }}
                  />
                </Block>
                <RenderTagList list={selectedIds.map((v) => options.find((o) => o.id === v)?.label)} onRemove={p.remove} wide />
              </Block>
            </FormControl>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}
