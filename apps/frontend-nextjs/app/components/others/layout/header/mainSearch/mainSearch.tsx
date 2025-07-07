const MainSearch = () => {
  const navigate = useNavigate()

  return (
    <div className='w-full'>
      <AsyncSelect
        aria-label='Søk etter krav, dokumentasjon eller behandling'
        placeholder='Søk etter krav, dokumentasjon eller behandling'
        components={{ Option, DropdownIndicator }}
        controlShouldRenderValue={false}
        loadingMessage={() => 'Søker...'}
        noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
        isClearable={false}
        loadOptions={useMainSearch}
        onChange={(selectedOption) => selectedOption && navigate([selectedOption].flat()[0].url)}
        styles={{
          // Updates default focus-border so it can be replaced with focus from DesignSystem
          control: (base) =>
            ({
              ...base,
              boxShadow: 'none',
              color: 'var(--a-gray-900)',
              border: '1px solid var(--a-gray-500)',
              borderRadius: 'var(--a-border-radius-medium)',
              ':focus-within': {
                boxShadow: 'var(--a-shadow-focus)',
                outline: 'none',
              },
              ':focus': { borderColor: 'var(--a-deepblue-600)' },
              ':hover': { borderColor: 'var(--a-border-action)' },
              cursor: 'text',
              div: { div: { color: 'var(--a-text-default)' } },
            }) as CSSObjectWithLabel,
          option: (base) => ({ ...base, color: 'var(--a-text-default)' }) as CSSObjectWithLabel,
          groupHeading: (base) =>
            ({
              ...base,
              color: 'black',
              fontSize: 'var(--a-font-size-large)',
              fontWeight: 'var(--a-font-weight-bold)',
              letterSpacing: 0,
              lineHeight: 'var(--a-font-line-height-large)',
              maring: 0,
            }) as CSSObjectWithLabel,
          // Make border and size of input box to be identical with those from DesignSystem
          valueContainer: (base) => ({ ...base, color: 'black' }) as CSSObjectWithLabel,
          // Remove separator
          indicatorSeparator: (base) => ({ ...base, display: 'none' }) as CSSObjectWithLabel,
        }}
      />
    </div>
  )
}

export default MainSearch
