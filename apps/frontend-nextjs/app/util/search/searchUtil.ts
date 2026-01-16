import { CSSObjectWithLabel } from 'react-select'

export const noOptionMessage = (inputValue: string) => {
  if (inputValue.length < 3 && inputValue.length > 0) {
    return 'Skriv minst 3 tegn for å søke'
  } else if (inputValue.length >= 3) {
    return `Fant ingen resultater for "${inputValue}"`
  } else {
    return ''
  }
}

export const selectOverrides = {
  control: (base: CSSObjectWithLabel) =>
    ({
      ...base,
      cursor: 'text',
      height: '3rem',
      color: 'var(--a-text-default)',
      border: '1px solid var(--a-border-subtle)',
      borderRadius: 'var(--a-border-radius-medium)',
      ':focus-within': {
        boxShadow: 'var(--a-shadow-focus)',
        outline: 'none',
      },
      ':focus': { borderColor: 'var(--a-border-action)' },
      ':hover': { borderColor: 'var(--a-border-action)' },
    }) as CSSObjectWithLabel,
  // input: (base: CSSObjectWithLabel) =>
  //   ({ ...base, color: 'var(--a-text-default)' }) as CSSObjectWithLabel,
  // option: (base: CSSObjectWithLabel) =>
  //   ({ ...base, color: 'var(--a-text-default)' }) as CSSObjectWithLabel,
  // menu: (base: CSSObjectWithLabel) =>
  //   ({ ...base, color: 'var(--a-text-default)' }) as CSSObjectWithLabel,
  // menuList: (base: CSSObjectWithLabel) =>
  //   ({ ...base, color: 'var(--a-text-default)' }) as CSSObjectWithLabel,
  // singleValue: (base: CSSObjectWithLabel) =>
  //   ({ ...base, color: 'var(--a-text-default)' }) as CSSObjectWithLabel,
}
