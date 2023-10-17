import * as React from 'react'
import {ReactElement, useEffect, useState} from 'react'
import {Select, SelectOverrides, SelectProps, SIZE, TYPE, Value} from 'baseui/select'
import {theme} from '../../util'
import {useDebouncedState, useQueryParam} from '../../util/hooks'
import {prefixBiasedSort} from '../../util/sort'
import {Block} from 'baseui/block'
import {useLocation, useNavigate} from 'react-router-dom'
import Button from '../common/Button'
import {Radio, RadioGroup} from 'baseui/radio'
import {borderColor, borderRadius, borderStyle, borderWidth, padding, paddingZero} from '../common/Style'
import SearchLabel from './components/SearchLabel'
import {NavigableItem, ObjectType} from '../admin/audit/AuditTypes'
import {Behandling, EtterlevelseDokumentasjon, Krav, KravStatus} from '../../constants'
import {ettlevColors, searchResultColor} from '../../util/theme'
import {kravName} from '../../pages/KravPage'
import {getKravByKravNumberAndVersion, searchKrav, searchKravByNumber} from '../../api/KravApi'
import {behandlingName, searchBehandling} from '../../api/BehandlingApi'
import {codelist, ListName} from '../../services/Codelist'
import {clearSearchIcon, filterIcon, navChevronDownIcon, searchIcon} from '../Images'
import {ParagraphMedium} from 'baseui/typography'
import {urlForObject} from '../common/RouteLink'
import {etterlevelseDokumentasjonName, searchEtterlevelsedokumentasjon} from '../../api/EtterlevelseDokumentasjonApi'

type SearchItem = { id: string; sortKey: string; label: ReactElement; type: NavigableItem | string }

type SearchType = 'all' | ObjectType.Krav | ObjectType.Behandling | ListName.UNDERAVDELING | ObjectType.EtterlevelseDokumentasjon

type GroupedResult = { Krav?: SearchItem[]; Dokumentasjon?: SearchItem[]; Behandling?: SearchItem[]; Underavdeling?: SearchItem[]; all?: SearchItem[]; __ungrouped: SearchItem[] }

type RadioProps = {
  $isHovered: boolean
  $checked: boolean
}

const SmallRadio = (value: SearchType, label: string) => {
  return (
    <Radio
      value={value}
      overrides={{
        Root: {
          style: {
            marginBottom: 0,
          },
        },
        Label: {
          style: (a: RadioProps) => ({
            ...paddingZero,
            ...(a.$isHovered ? { color: theme.colors.positive400 } : {}),
          }),
        },
        RadioMarkOuter: {
          style: (a: RadioProps) => ({
            ...(a.$isHovered ? { backgroundColor: theme.colors.positive400 } : {}),
          }),
        },
        RadioMarkInner: {
          style: (a: RadioProps) => ({
            width: a.$checked ? theme.sizing.scale100 : theme.sizing.scale650,
            height: a.$checked ? theme.sizing.scale100 : theme.sizing.scale650,
          }),
        },
      }}
    >
      <ParagraphMedium
        $style={{
          marginLeft: theme.sizing.scale300,
          marginTop: theme.sizing.scale500,
          marginBottom: theme.sizing.scale500,
        }}
      >
        {label}
      </ParagraphMedium>
    </Radio>
  )
}

const SelectType = (props: { type: SearchType; setType: (type: SearchType) => void }) => {
  const [filter, setFilter] = useState(false)
  return (
    <Block width="100%" backgroundColor={ettlevColors.white}>
      {!filter && (
        <Block width="100%" display="flex" flex="1" justifyContent="flex-end" marginBottom="-10px">
          <Button
            size="mini"
            onClick={() => setFilter(!filter)}
            startEnhancer={<img alt="filter icon" src={filterIcon} />}
            kind="tertiary"
            marginRight
            label="Filter søkeresultat"
            notBold
          >
            <ParagraphMedium
              $style={{
                fontSize: theme.sizing.scale600,
                marginTop: 0,
                marginBottom: 0,
              }}
            >
              Vis filter
            </ParagraphMedium>
          </Button>
        </Block>
      )}
      {filter && (
        <Block backgroundColor="#FFFFFF" display="flex" $style={{}}>
          <Block marginLeft="3px" marginRight="3px" marginBottom="scale1200" backgroundColor={ettlevColors.grey50} display="flex" flex="1" justifyContent="center">
            <RadioGroup
              onChange={(e) => props.setType(e.target.value as SearchType)}
              align="horizontal"
              autoFocus
              value={props.type}
              overrides={{
                RadioGroupRoot: {
                  style: {
                    justifyContent: 'space-between',
                    width: '100%',
                    paddingLeft: theme.sizing.scale550,
                    paddingRight: theme.sizing.scale550,
                  },
                },
              }}
            >
              {SmallRadio('all', 'Alle')}
              {SmallRadio(ObjectType.Krav, 'Krav')}
              {SmallRadio(ObjectType.EtterlevelseDokumentasjon, 'Dokumentasjon')}
              {SmallRadio(ObjectType.Behandling, 'Behandling')}
              {SmallRadio(ListName.UNDERAVDELING, 'Underavdeling')}
            </RadioGroup>
          </Block>
        </Block>
      )}
    </Block>
  )
}

const kravMap = (t: Krav) => ({
  id: t.id,
  sortKey: t.navn,
  label: <SearchLabel name={kravName(t)} type={'Krav'} backgroundColor={searchResultColor.kravBackground} />,
  type: ObjectType.Krav,
})

const behandlingMap = (t: Behandling) => ({
  id: t.id,
  sortKey: t.navn,
  label: <SearchLabel name={behandlingName(t)} type={'Behandling'} backgroundColor={searchResultColor.behandlingBackground} />,
  type: ObjectType.Behandling,
})

const EtterlevelseDokumentasjonMap = (t: EtterlevelseDokumentasjon) => ({
  id: t.id,
  sortKey: t.title,
  label: <SearchLabel name={etterlevelseDokumentasjonName(t)} type={'Dokumentasjon'} backgroundColor={searchResultColor.dokumentasjonBackground} />,
  type: ObjectType.EtterlevelseDokumentasjon,
})

const getCodelist = (search: string, list: ListName, typeName: string) => {
  return codelist
    .getCodes(list)
    .filter((c) => c.shortName.toLowerCase().indexOf(search.toLowerCase()) >= 0)
    .map(
      (c) =>
        ({
          id: c.code,
          sortKey: c.shortName,
          label: <SearchLabel name={c.shortName} type={typeName} />,
          type: list,
        }) as SearchItem,
    )
}

const searchCodelist = (search: string, list: ListName & NavigableItem, typeName: string, backgroundColor: string) =>
  codelist
    .getCodes(list)
    .filter((c) => c.shortName.toLowerCase().indexOf(search.toLowerCase()) >= 0)
    .map((c) => ({
      id: c.code,
      sortKey: c.shortName,
      label: <SearchLabel name={c.shortName} type={typeName} backgroundColor={backgroundColor} />,
      type: list,
    }))

const order = (type: NavigableItem | string) => {
  switch (type) {
    case ObjectType.Krav:
      return 0
    case ObjectType.Behandling:
      return 1
  }
  return -1
}

const useMainSearch = (searchParam?: string) => {
  const [search, setSearch] = useDebouncedState<string>(searchParam || '', 500)
  const [searchResult, setSearchResult] = React.useState<SearchItem[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [type, setType] = useState<SearchType>('all')

  useEffect(() => {
    setSearchResult([])

    if (type === ListName.UNDERAVDELING && search.length > 2) {
      setSearchResult(getCodelist(search, ListName.UNDERAVDELING, 'Underavdeling'))
    } else {
      if (search && search.replace(/ /g, '').length > 2) {
        ;(async () => {
          let results: SearchItem[] = []
          let searches: Promise<any>[] = []
          const compareFn = (a: SearchItem, b: SearchItem) => prefixBiasedSort(search, a.sortKey, b.sortKey)
          const add = (items: SearchItem[]) => {
            results = [...results, ...items]
            results = results
              .filter((item, index, self) => index === self.findIndex((searchItem) => searchItem.id === item.id))
              .sort((a, b) => {
                const same = a.type === b.type
                const typeOrder = order(a.type) - order(b.type)
                return same || typeOrder !== 0 ? typeOrder : compareFn(a, b)
              })
            setSearchResult(results)
          }
          setLoading(true)

          if (type === 'all') {
            add(searchCodelist(search, ListName.UNDERAVDELING, 'Underavdeling', searchResultColor.underavdelingBackground))
          }

          if (type === 'all' || type === ObjectType.Krav) {
            searches.push((async () => add((await searchKrav(search)).filter((k) => k.status !== KravStatus.UTGAATT).map(kravMap)))())

            let kravNumber = search
            if (kravNumber[0].toLowerCase() === 'k') {
              kravNumber = kravNumber.substring(1)
            }

            if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 === 0) {
              searches.push(
                (async () =>
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
                  ))(),
              )
            }

            if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 !== 0) {
              const kravNummerMedVersjon = kravNumber.split('.')
              const searchResult = [await getKravByKravNumberAndVersion(kravNummerMedVersjon[0], kravNummerMedVersjon[1])].filter((k) => k && k.status !== KravStatus.UTGAATT)
              if (typeof searchResult[0] !== 'undefined') {
                const mappedResult = [
                  {
                    id: searchResult[0].id,
                    sortKey: searchResult[0].navn,
                    label: <SearchLabel name={kravName(searchResult[0])} type={'Krav'} backgroundColor={searchResultColor.kravBackground} />,
                    type: ObjectType.Krav,
                  },
                ]

                searches.push((async () => add(mappedResult))())
              }
            }
          }

          if (type === 'all' || type === ObjectType.Behandling) {
            searches.push((async () => add((await searchBehandling(search)).map(behandlingMap)))())
          }
          if (type === 'all' || type === ObjectType.EtterlevelseDokumentasjon) {
            searches.push((async () => add((await searchEtterlevelsedokumentasjon(search)).map(EtterlevelseDokumentasjonMap)))())
          }

          await Promise.all(searches)
          setLoading(false)
        })()
      }
    }
  }, [search, type])
  return [setSearch, searchResult, loading, type, setType] as [(text: string) => void, SearchItem[], boolean, SearchType, (type: SearchType) => void]
}

interface customSelectProp {
  setValue: Function
}

type SelectPropWithSetValue = SelectProps & customSelectProp

const MainSearchSelector = (props: SelectPropWithSetValue) => {
  const overrides: SelectOverrides = {
    Root: {
      style: ({ $isFocused }) => ({
        ...borderWidth($isFocused ? '3px' : ''),
        ...borderStyle($isFocused ? 'solid' : ''),
        ...borderColor($isFocused ? ettlevColors.focusOutline : ''),
        ...borderRadius($isFocused ? '8px' : ''),
      }),
    },
    SearchIcon: {
      component: () => <img src={searchIcon} alt="Søk ikon" />,
    },
    DropdownListItem: {
      style: {
        paddingTop: '0px',
        paddingRight: '5px',
        paddingBottom: '0px',
        paddingLeft: '5px',
        fontSize: '18px',
      },
    },
    ClearIcon: {
      props: {
        overrides: {
          Svg: {
            component: () => (
              <Button notBold size="compact" kind="tertiary" onClick={() => props.setValue([])}>
                <img src={clearSearchIcon} alt="tøm" />
              </Button>
            ),
          },
        },
      },
    },
    ControlContainer: {
      style: {
        ...borderWidth('1px'),
        ':hover': {
          backgroundColor: ettlevColors.green50,
        },
      },
    },
    SelectArrow: {
      component: () => <img src={navChevronDownIcon} alt="Chevron ned" />,
    },
  }
  return <Select {...props} overrides={overrides} />
}

const MainSearch = () => {
  const searchParam = useQueryParam('search')
  const [setSearch, searchResult, loading, type, setType] = useMainSearch(searchParam)
  const [filterClicked, setFilterClicked] = useState<boolean>(false)
  const [value, setValue] = useState<Value>(searchParam ? [{ id: searchParam, label: searchParam }] : [])
  const location = useLocation()
  const navigate = useNavigate()

  const getNoResultMessage = () => {
    let msg = ''

    if (!value.length || !value[0].id || (value[0].id && value[0].id.toString().length < 3)) {
      msg = 'Skriv minst tre bokstaver i søkefeltet.'
    } else if (!loading && !searchResult.length) {
      msg = `Ingen treff: ${value[0].id}`
    }

    return msg ? (
      <Block
        display="flex"
        justifyContent="center"
        color={ettlevColors.green800}
        backgroundColor={ettlevColors.white}
        $style={{
          ...padding('12px', '24px'),
          paddingTop: '0px',
        }}
      >
        {msg}
      </Block>
    ) : (
      <Block />
    )
  }

  const filterOption = {
    id: 'filter',
    label: (
      <Block>
        <SelectType type={type} setType={setType} />
        {getNoResultMessage()}
      </Block>
    ),
    sortKey: 'filter',
    type: '__ungrouped',
  }

  const [groupedSearchResult, setGroupedSearchResult] = useState<GroupedResult>({ __ungrouped: [] })

  useEffect(() => {
    const groupedResults: GroupedResult = {
      __ungrouped: [],
      Krav: [],
      Dokumentasjon: [],
      all: [],
      Behandling: [],
      Underavdeling: [],
    }

    if (value.length && value[0].id && value[0].id.toString().length > 2) {
      groupedResults.__ungrouped.push(filterOption)
    }

    searchResult.forEach((r: SearchItem) => {
      if (r.type === 'Krav') {
        groupedResults.Krav?.push(r)
      } else if (r.type === 'EtterlevelseDokumentasjon') {
        groupedResults.Dokumentasjon?.push(r)
      } else if (r.type === 'Behandling') {
        groupedResults.Behandling?.push(r)
      } else if (r.type === 'UNDERAVDELING') {
        groupedResults.Underavdeling?.push(r)
      } else {
        groupedResults.all?.push(r)
      }
    })

    setGroupedSearchResult(groupedResults)
  }, [searchResult, loading])

  return (
    <Block width="100%">
      <Block display="flex" position="relative" alignItems="center" width={'100%'}>
        <MainSearchSelector
          id="search"
          clearable
          closeOnSelect={!filterClicked}
          onClose={() => setType('all')}
          size={SIZE.compact}
          backspaceRemoves
          startOpen={!!searchParam}
          noResultsMsg={<Block color={ettlevColors.green800}>Skriv minst tre bokstaver i søkefeltet.</Block>}
          autoFocus={location.pathname === '/'}
          isLoading={loading}
          maxDropdownHeight="400px"
          searchable
          type={TYPE.search}
          options={groupedSearchResult}
          placeholder={'Søk etter krav, dokumentasjon eller behandling'}
          aria-label={'Søk etter krav, dokumentasjon eller behandling'}
          value={value}
          onOpen={() => setFilterClicked(true)}
          onInputChange={(event) => {
            if (event.currentTarget.value.toLowerCase().match(/b[0-9]+/)) {
              setSearch('0' + event.currentTarget.value.substring(1))
            } else {
              setSearch(event.currentTarget.value)
            }
            setValue([{ id: event.currentTarget.value, label: event.currentTarget.value }])
          }}
          onChange={(params) => {
            const item = params.value[0] as SearchItem
            ;(async () => {
              if (item && item.type !== '__ungrouped') {
                setValue([item])
                navigate(urlForObject(item.type, item.id))
                window.location.reload()
              } else if (item && item.type === '__ungrouped') {
                setFilterClicked(true)
              }
            })()
          }}
          filterOptions={(options) => options}
          setValue={setValue}
        />
      </Block>
    </Block>
  )
}

export default MainSearch
