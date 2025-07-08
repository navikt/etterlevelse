export const noOptionMessage = (inputValue: string) => {
  if (inputValue.length < 3 && inputValue.length > 0) {
    return 'Skriv minst 3 tegn for å søke'
  } else if (inputValue.length >= 3) {
    return `Fant ingen resultater for "${inputValue}"`
  } else {
    return ''
  }
}
