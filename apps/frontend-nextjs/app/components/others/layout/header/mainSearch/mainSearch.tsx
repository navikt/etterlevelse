'use client'

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
import { Search } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { KeyboardEvent, useEffect, useRef, useState } from 'react'

type TSearchGroup = { label: string; options: TSearchItem[] }

const EtterlevelseDokumentasjonMap = (props: IEtterlevelseDokumentasjon): TSearchItem => ({
  value: props.id,
  label: etterlevelseDokumentasjonName(props),
  tag: 'Dokumentasjon',
  url: `/dokumentasjon/${props.id}`,
})

const behandlingMap = (props: IBehandling): TSearchItem => ({
  value: props.id,
  label: behandlingName(props),
  tag: EObjectType.Behandling,
  url: `/dokumentasjoner?tab=behandlingsok&behandlingId=${props.id}`,
})

const fetchSearchGroups = async (searchParam: string): Promise<TSearchGroup[]> => {
  if (!searchParam || searchParam.replace(/ /g, '').length <= 2) {
    return []
  }

  const [krav, dokumentasjon, behandling] = await Promise.all([
    kravMainHeaderSearch(searchParam),
    searchEtterlevelsedokumentasjon(searchParam).then((result) =>
      result.map(EtterlevelseDokumentasjonMap)
    ),
    searchBehandling(searchParam).then((result) => result.map(behandlingMap)),
  ])

  return [
    { label: EObjectType.Krav, options: krav },
    { label: 'Dokumentasjon', options: dokumentasjon },
    { label: EObjectType.Behandling, options: behandling },
  ]
}

const MainSearch = () => {
  const router: AppRouterInstance = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [groups, setGroups] = useState<TSearchGroup[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const flatOptions: TSearchItem[] = groups.flatMap((group) => group.options)
  const hasOptions: boolean = flatOptions.length > 0

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleChange = async (value: string) => {
    setInputValue(value)
    setActiveIndex(-1)

    if (value.replace(/ /g, '').length <= 2) {
      setGroups([])
      setIsOpen(value.length > 0)
      return
    }

    setIsLoading(true)
    setIsOpen(true)
    setGroups(await fetchSearchGroups(value))
    setIsLoading(false)
  }

  const selectItem = (item: TSearchItem) => {
    setIsOpen(false)
    setInputValue('')
    router.push(item.url)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !hasOptions) {
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % flatOptions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? flatOptions.length - 1 : index - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      selectItem(flatOptions[activeIndex])
    }
  }

  return (
    <div className='relative w-full' ref={containerRef}>
      <Search
        label='Søk etter krav, dokumentasjon eller behandling'
        hideLabel
        placeholder='Søk etter krav, dokumentasjon eller behandling'
        variant='simple'
        className='main-search'
        value={inputValue}
        onChange={handleChange}
        onFocus={() => inputValue.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        role='combobox'
        aria-expanded={isOpen}
        aria-controls='main-search-listbox'
        aria-activedescendant={activeIndex >= 0 ? `main-search-option-${activeIndex}` : undefined}
      />
      {isOpen && (
        <div
          id='main-search-listbox'
          role='listbox'
          className='absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-(--ax-border-subtle) bg-(--ax-bg-raised) shadow-lg'
        >
          {isLoading && <div className='px-4 py-2'>Søker...</div>}
          {!isLoading && !hasOptions && (
            <div className='px-4 py-2'>{noOptionMessage(inputValue)}</div>
          )}
          {!isLoading &&
            groups.map(
              (group) =>
                group.options.length > 0 && (
                  <div key={group.label}>
                    <div className='px-4 pt-2 text-sm font-bold'>{group.label}</div>
                    {group.options.map((option) => {
                      const index: number = flatOptions.indexOf(option)
                      return (
                        <div
                          key={option.value}
                          id={`main-search-option-${index}`}
                          role='option'
                          aria-selected={activeIndex === index}
                          tabIndex={-1}
                          className='cursor-pointer px-4 py-2'
                          style={{
                            backgroundColor:
                              activeIndex === index ? 'var(--ax-bg-moderate-hoverA)' : undefined,
                          }}
                          onMouseDown={(event) => {
                            event.preventDefault()
                            selectItem(option)
                          }}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          {option.label}
                        </div>
                      )
                    })}
                  </div>
                )
            )}
        </div>
      )}
    </div>
  )
}

export default MainSearch
