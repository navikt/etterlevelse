import { MagnifyingGlassIcon } from '@navikt/aksel-icons'
import { BodyShort } from '@navikt/ds-react'
import { useNavigate } from 'react-router-dom'
import { CSSObjectWithLabel, DropdownIndicatorProps, OptionProps, components } from 'react-select'
import AsyncSelect from 'react-select/async'
import { behandlingName, searchBehandling } from '../../api/BehandlingApi'
import {
  etterlevelseDokumentasjonName,
  searchEtterlevelsedokumentasjon,
} from '../../api/EtterlevelseDokumentasjonApi'
import { getKravByKravNumberAndVersion, searchKrav, searchKravByNumber } from '../../api/KravApi'
import { EKravStatus, IBehandling, IEtterlevelseDokumentasjon, IKrav } from '../../constants'
import { kravName } from '../../pages/KravPage'
import { EObjectType } from '../admin/audit/AuditTypes'

type TSearchItem = { value: string; label: string; tag: string; url: string }

const kravMap = (t: IKrav) => ({
  value: t.id,
  label: kravName(t),
  tag: EObjectType.Krav as string,
  url: `krav/${t.id}`,
})

const behandlingMap = (t: IBehandling): TSearchItem => ({
  value: t.id,
  label: behandlingName(t),
  tag: EObjectType.Behandling,
  url: `dokumentasjoner/behandlingsok?behandlingId=${t.id}`,
})

const EtterlevelseDokumentasjonMap = (t: IEtterlevelseDokumentasjon): TSearchItem => ({
  value: t.id,
  label: etterlevelseDokumentasjonName(t),
  tag: 'Dokumentasjon',
  url: `dokumentasjon/${t.id}`,
})

const kravSearch = async (searchParam: string) => {
  let result: TSearchItem[] = []
  const add = (items: TSearchItem[]) => {
    result = [...result, ...items]
    result = result.filter(
      (item, index, self) =>
        index === self.findIndex((searchItem) => searchItem.value === item.value)
    )
  }

  result.push(
    ...(await searchKrav(searchParam)).filter((k) => k.status !== EKravStatus.UTGAATT).map(kravMap)
  )

  let kravNumber = searchParam
  if (kravNumber[0].toLowerCase() === 'k') {
    kravNumber = kravNumber.substring(1)
  }

  if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 === 0) {
    add(
      (await searchKravByNumber(Number.parseFloat(kravNumber).toString()))
        .filter((k) => k.status !== EKravStatus.UTGAATT)
        .sort((a, b) => {
          if (a.kravNummer === b.kravNummer) {
            return b.kravVersjon - a.kravVersjon
          } else {
            return b.kravNummer - a.kravNummer
          }
        })
        .map(kravMap)
    )
  }

  if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 !== 0) {
    const kravNummerMedVersjon = kravNumber.split('.')
    const searchResult = [
      await getKravByKravNumberAndVersion(kravNummerMedVersjon[0], kravNummerMedVersjon[1]),
    ].filter((k) => k && k.status !== EKravStatus.UTGAATT)
    if (typeof searchResult[0] !== 'undefined') {
      const mappedResult = [
        {
          value: searchResult[0].id,
          label: kravName(searchResult[0]),
          tag: EObjectType.Krav,
          url: `krav/${searchResult[0].id}`,
        },
      ]
      add(mappedResult)
    }
  }
  return result
}

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

const Option = (properties: OptionProps<TSearchItem>) => {
  return (
    <components.Option {...properties}>
      <div className="flex justify-between">
        <BodyShort className="text-icon-on-warning">{properties.data.label}</BodyShort>
      </div>
    </components.Option>
  )
}

const DropdownIndicator = (props: DropdownIndicatorProps<TSearchItem>) => {
  return (
    <components.DropdownIndicator {...props}>
      <MagnifyingGlassIcon title="Søk" aria-label="Søk" />
    </components.DropdownIndicator>
  )
}

const MainSearch = () => {
  const navigate = useNavigate()

  return (
    <div className="w-full">
      <AsyncSelect
        aria-label="Søk etter krav, dokumentasjon eller behandling"
        placeholder="Søk etter krav, dokumentasjon eller behandling"
        components={{ Option, DropdownIndicator }}
        controlShouldRenderValue={false}
        loadingMessage={() => 'Søker...'}
        noOptionsMessage={({ inputValue }) =>
          inputValue.length < 3
            ? 'Skriv minst tre tegn for å søke'
            : `Fant ingen resultater for "${inputValue}"`
        }
        isClearable={false}
        loadOptions={useMainSearch}
        onChange={(selectedOption) => selectedOption && navigate([selectedOption].flat()[0].url)}
        styles={{
          // Removes default focus-border so it can be replaced with focus from DesignSystem
          control: (base) =>
            ({
              ...base,
              boxShadow: 'none',
              border: 0,
              cursor: 'text',
              div: { div: { color: 'var(--a-text-default)' } },
            }) as CSSObjectWithLabel,
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
