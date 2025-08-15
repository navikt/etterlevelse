import { searchBehandling } from '@/api/behandlingskatalog/behandlingskatalogApi'
import { searchEtterlevelsedokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { kravMainHeaderSearch } from '@/api/krav/kravApi'
import { EObjectType } from '@/constants/admin/audit/auditConstants'
import { IBehandling } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { TSearchItem } from '@/constants/search/searchConstants'
import { behandlingName } from '@/util/behandling/behandlingUtil'
import { etterlevelseDokumentasjonName } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { noOptionMessage } from '@/util/search/searchUtil'
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

const EtterlevelseDokumentasjonMap = (props: IEtterlevelseDokumentasjon): TSearchItem => ({
  value: props.id,
  label: etterlevelseDokumentasjonName(props),
  tag: 'Dokumentasjon',
  url: `dokumentasjon/${props.id}`,
})

const behandlingMap = (props: IBehandling): TSearchItem => ({
  value: props.id,
  label: behandlingName(props),
  tag: EObjectType.Behandling,
  url: `dokumentasjoner/behandlingsok?behandlingId=${props.id}`,
})

const useMainSearch = async (
  searchParam: string
): Promise<
  {
    label: string
    options: TSearchItem[]
  }[]
> => {
  if (searchParam && searchParam.replace(/ /g, '').length > 2) {
    const result: [TSearchItem[], TSearchItem[], TSearchItem[]] = await Promise.all([
      await kravMainHeaderSearch(searchParam),
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
        instanceId='main-search'
        aria-label='Søk etter krav, dokumentasjon eller behandling'
        placeholder='Søk etter krav, dokumentasjon eller behandling'
        components={{ DropdownIndicator, Option }}
        controlShouldRenderValue={false}
        loadingMessage={() => 'Søker...'}
        noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
        isClearable={false}
        loadOptions={useMainSearch}
        onChange={(selectedOption) => selectedOption && router.push([selectedOption].flat()[0].url)}
        styles={{
          // Updates default focus-border so it can be replaced with focus from DesignSystem
          control: (base: CSSObjectWithLabel) =>
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
          option: (base: CSSObjectWithLabel) =>
            ({ ...base, color: 'var(--a-text-default)' }) as CSSObjectWithLabel,
          groupHeading: (base: CSSObjectWithLabel) =>
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
          valueContainer: (base: CSSObjectWithLabel) =>
            ({ ...base, color: 'black' }) as CSSObjectWithLabel,
          // Remove separator
          indicatorSeparator: (base: CSSObjectWithLabel) =>
            ({ ...base, display: 'none' }) as CSSObjectWithLabel,
        }}
      />
    </div>
  )
}

export default MainSearch
