import { MagnifyingGlassIcon } from '@navikt/aksel-icons'
import { DropdownIndicatorProps, components } from 'react-select'

export const DropdownIndicator = (props: DropdownIndicatorProps) => (
  <components.DropdownIndicator {...props}>
    <MagnifyingGlassIcon title='Søk' aria-label='Søk' />
  </components.DropdownIndicator>
)
