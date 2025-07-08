import { behandlingName, searchBehandling } from '@/api/common/behandlingskatalogen/api'
import {
  etterlevelseDokumentasjonName,
  searchEtterlevelsedokumentasjon,
} from '@/api/etterlevelse/dokumentasjon/dokumentasjon'
import { EObjectType } from '@/components/kraveier/admin/audit/audit'
import { kravSearch } from '@/components/kraveier/krav'
import { noOptionMessage } from '@/components/others/utils/search/search'
import { IBehandling } from '@/constants/common/behandlingskatalogen/constants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelse/constants'
import { TSearchItem } from '@/constants/other/search/constants'
import { MagnifyingGlassIcon } from '@navikt/aksel-icons'
import { BodyShort } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { CSSObjectWithLabel, DropdownIndicatorProps, OptionProps, components } from 'react-select'
import AsyncSelect from 'react-select/async'

const Option = (properties: OptionProps<TSearchItem>) => (
  <components.Option {...properties}>
    <div className='flex justify-between'>
      <BodyShort className='text-icon-on-warning'>{properties.data.label}</BodyShort>
    </div>
  </components.Option>
)

const DropdownIndicator = (props: DropdownIndicatorProps<TSearchItem>) => (
  <components.DropdownIndicator {...props}>
    <MagnifyingGlassIcon title='Søk' aria-label='Søk' />
  </components.DropdownIndicator>
)

const EtterlevelseDokumentasjonMap = (t: IEtterlevelseDokumentasjon): TSearchItem => ({
  value: t.id,
  label: etterlevelseDokumentasjonName(t),
  tag: 'Dokumentasjon',
  url: `dokumentasjon/${t.id}`,
})

const behandlingMap = (t: IBehandling): TSearchItem => ({
  value: t.id,
  label: behandlingName(t),
  tag: EObjectType.Behandling,
  url: `dokumentasjoner/behandlingsok?behandlingId=${t.id}`,
})

const useMainSearch = async (searchParam: string) => {
  if (searchParam && searchParam.replace(/ /g, '').length > 2) {
    const result = await Promise.all([
      await kravSearch(searchParam),
      (await searchEtterlevelsedokumentasjon(searchParam)).map(EtterlevelseDokumentasjonMap),
      (await searchBehandling(searchParam)).map(behandlingMap),
    ])
    return [
      {
        label: EObjectType.Krav,
        options: result[0],
      },
      {
        label: 'Dokumentasjon',
        options: result[1],
      },
      {
        label: EObjectType.Behandling,
        options: result[2],
      },
    ]
  }
  return []
}

const MainSearch = () => {
  const router: AppRouterInstance = useRouter()

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
        onChange={(selectedOption) => selectedOption && router.push([selectedOption].flat()[0].url)}
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
