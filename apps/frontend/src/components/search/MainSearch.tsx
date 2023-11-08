import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ObjectType } from '../admin/audit/AuditTypes'
import { Behandling, EtterlevelseDokumentasjon, Krav, KravStatus } from '../../constants'
import { kravName } from '../../pages/KravPage'
import { getKravByKravNumberAndVersion, searchKrav, searchKravByNumber } from '../../api/KravApi'
import { behandlingName, searchBehandling } from '../../api/BehandlingApi'
import { etterlevelseDokumentasjonName, searchEtterlevelsedokumentasjon } from '../../api/EtterlevelseDokumentasjonApi'
import { OptionProps, components } from 'react-select'
import AsyncSelect from 'react-select/async'
import { BodyShort } from '@navikt/ds-react'

type SearchItem = { value: string, label: string, tag: string, url: string }

const kravMap = (t: Krav) => ({
  value: t.id,
  label: kravName(t),
  tag: ObjectType.Krav as string,
  url: `krav/${t.id}`
})

const behandlingMap = (t: Behandling): SearchItem => ({
  value: t.id,
  label: behandlingName(t),
  tag: ObjectType.Behandling,
  url: `dokumentasjoner/behandlingsok?behandlingId=${t.id}`
})

const EtterlevelseDokumentasjonMap = (t: EtterlevelseDokumentasjon): SearchItem => ({
  value: t.id,
  label: etterlevelseDokumentasjonName(t),
  tag: 'Dokumentasjon',
  url: `dokumentasjon/${t.id}`,
})

const kravSearch = async (searchParam: string) => {
  let result: SearchItem[] = []
  const add = (items: SearchItem[]) => {
    result = [...result, ...items]
    result = result
      .filter((item, index, self) => index === self.findIndex((searchItem) => searchItem.value === item.value))
  }

  result.push(...(await searchKrav(searchParam)).filter((k) => k.status !== KravStatus.UTGAATT).map(kravMap))


  let kravNumber = searchParam
  if (kravNumber[0].toLowerCase() === 'k') {
    kravNumber = kravNumber.substring(1)
  }

  if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 === 0) {
    add(
      (await searchKravByNumber(Number.parseFloat(kravNumber).toString()))
        .filter((k) => k.status !== KravStatus.UTGAATT)
        .sort((a, b) => {
          if (a.kravNummer === b.kravNummer) {
            return b.kravVersjon - a.kravVersjon
          } else {
            return b.kravNummer - a.kravNummer
          }
        })
        .map(kravMap),
    )
  }

  if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 !== 0) {
    const kravNummerMedVersjon = kravNumber.split('.')
    const searchResult = [await getKravByKravNumberAndVersion(kravNummerMedVersjon[0], kravNummerMedVersjon[1])].filter((k) => k && k.status !== KravStatus.UTGAATT)
    if (typeof searchResult[0] !== 'undefined') {
      const mappedResult = [
        {
          value: searchResult[0].id,
          label: kravName(searchResult[0]),
          tag: ObjectType.Krav,
          url: `krav/${searchResult[0].id}`
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
      (await kravSearch(searchParam)),
      (await searchEtterlevelsedokumentasjon(searchParam)).map(EtterlevelseDokumentasjonMap),
      (await searchBehandling(searchParam)).map(behandlingMap)
    ])
    return [
      {
        label: ObjectType.Krav,
        options: result[0]
      },
      {
        label: 'Dokumentasjon',
        options: result[1]
      },
      {
        label: ObjectType.Behandling,
        options: result[2]
      },
    ]
  }
  return []
}

const Option = (properties: OptionProps<SearchItem>) => {
  return (
    <components.Option {...properties}>
      <div className="flex justify-between">
        <BodyShort className="text-icon-on-warning">{properties.data.label}</BodyShort>
      </div>
    </components.Option>
  )
}

const MainSearch = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="w-full">
      <AsyncSelect
        id="search"
        aria-label="Søk etter krav, dokumentasjon eller behandling"
        placeholder="Søk etter krav, dokumentasjon eller behandling"
        autoFocus={location.pathname === '/'}
        components={{ Option }}
        controlShouldRenderValue={false}
        loadingMessage={() => 'Søker...'}
        noOptionsMessage={({ inputValue }) =>
          inputValue.length < 3
            ? 'Skriv minst tre tegn for å søke'
            : `Fant ingen resultater for "${inputValue}"`
        }
        loadOptions={useMainSearch}
        onChange={(selectedOption) => selectedOption && navigate([selectedOption].flat()[0].url)}
        styles={{
          // Removes default focus-border so it can be replaced with focus from DesignSystem
          control: (base) => ({
            ...base,
            boxShadow: 'none',
            border: 0,
            cursor: 'text',
            div: { div: { color: 'var(--a-text-default)' } },
          }),
          groupHeading: (base) => ({
            ...base,
            color: 'black',
            fontSize: 'var(--a-font-size-large)',
            fontWeight: 'var(--a-font-weight-bold)',
            letterSpacing: 0,
            lineHeight: 'var(--a-font-line-height-large)',
            maring: 0
          }),
          // Make border and size of input box to be identical with those from DesignSystem
          valueContainer: (base) => ({ ...base, color: 'black' }),
          // Remove separator
          indicatorSeparator: (base) => ({ ...base, display: 'none' }),
          // Remove dropdownIndicator
          dropdownIndicator: (base) => ({ ...base, display: 'none' }),
        }}
      />
    </div>
  )
}

export default MainSearch
