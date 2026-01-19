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
      borderColor: '#000',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: 'var(--a-border-radius-medium)',
      ':focus-within': {
        boxShadow: 'var(--a-shadow-focus)',
        outline: 'none',
      },
      ':focus': { borderColor: '#000' },
      ':hover': { borderColor: '#000' },
    }) as CSSObjectWithLabel,
}
