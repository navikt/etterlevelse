import { CSSObjectWithLabel } from 'react-select'

export const selectOverrides = {
  control: (base: CSSObjectWithLabel) =>
    ({
      ...base,
      cursor: 'text',
      height: '3rem',
      color: 'var(--a-gray-900)',
      border: '1px solid var(--a-gray-500)',
      borderRadius: 'var(--a-border-radius-medium)',
      ':focus-within': {
        boxShadow: 'var(--a-shadow-focus)',
        outline: 'none',
      },
      ':focus': { borderColor: 'var(--a-deepblue-600)' },
      ':hover': { borderColor: 'var(--a-border-action)' },
    }) as CSSObjectWithLabel,
}
