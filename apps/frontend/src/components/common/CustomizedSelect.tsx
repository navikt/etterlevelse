import {
  Select,
  SelectOverrides,
  SelectProps,
  StatefulSelect,
  StatefulSelectProps,
} from 'baseui/select'
import _ from 'lodash'
import { ettlevColors } from '../../util/theme'
import { navChevronDownIcon } from '../Images'
import { borderWidth } from './Style'

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
      $isOpen ? (
        <img src={navChevronDownIcon} alt="Chevron opp" style={{ transform: 'rotate(180deg)' }} />
      ) : (
        <img src={navChevronDownIcon} alt="Chevron ned" />
      ),
  },
  DropdownListItem: {
    style: {
      fontSize: '18px',
      marginTop: '4px',
      marginBottom: '4px',
    },
  },
}

export const CustomizedStatefulSelect = (props: StatefulSelectProps) => {
  const overrides = _.merge(customOverrides, props.overrides)

  return <StatefulSelect {...props} overrides={overrides} />
}

export const CustomizedSelect = (props: SelectProps) => {
  const overrides = _.merge(customOverrides, props.overrides)

  return <Select {...props} overrides={overrides} />
}
export default CustomizedSelect
