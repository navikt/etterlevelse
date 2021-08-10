import * as React from 'react'
import { ReactElement, useEffect, useState } from 'react'
import { SIZE, TYPE, Value } from 'baseui/select'
import { theme } from '../../util'
import { useDebouncedState, useQueryParam } from '../../util/hooks'
import { prefixBiasedSort } from '../../util/sort'
import { Block } from 'baseui/block'
import { useHistory, useLocation } from 'react-router-dom'
import Button from '../common/Button'
import { Radio, RadioGroup } from 'baseui/radio'
import { borderColor, borderRadius, borderWidth, padding, paddingZero } from '../common/Style'
import SearchLabel from './components/SearchLabel'
import { NavigableItem, ObjectType } from '../admin/audit/AuditTypes'
import { Behandling, Krav } from '../../constants'
import shortid from 'shortid'
import { ettlevColors, searchResultColor } from '../../util/theme'
import { kravName } from '../../pages/KravPage'
import { getKravByKravNumberAndVersion, getKravByKravNummer, searchKrav } from '../../api/KravApi'
import { behandlingName, searchBehandling } from '../../api/BehandlingApi'
import { codelist, ListName } from '../../services/Codelist'
import { clearSearchIcon, filterIcon, searchIcon } from '../Images'
import CustomizedSelect from '../common/CustomizedSelect'
import { Paragraph2 } from 'baseui/typography'
import { urlForObject } from '../common/RouteLink'

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@')

type SearchItem = { id: string; sortKey: string; label: ReactElement; type: NavigableItem | string }

type SearchType = 'all' | ObjectType.Krav | ObjectType.Behandling | ListName.UNDERAVDELING

type GroupedResult = { Krav?: SearchItem[]; Behandling?: SearchItem[]; Underavdeling?: SearchItem[]; all?: SearchItem[]; __ungrouped: SearchItem[] }

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
      <Paragraph2
        $style={{
          marginLeft: theme.sizing.scale300,
          marginTop: theme.sizing.scale500,
          marginBottom: theme.sizing.scale500,
        }}
      >
        {label}
      </Paragraph2>
    </Radio>
  )
}

const SelectType = (props: { type: SearchType; setType: (type: SearchType) => void }) => {
  const [filter, setFilter] = useState(false)
  return (
    <Block width="100%" backgroundColor={ettlevColors.white}>
      {!filter && <Block width="100%" display="flex" flex="1" justifyContent="flex-end">
        <Button onClick={() => setFilter(!filter)} startEnhancer={<img alt="" src={filterIcon} />} kind="tertiary" marginRight label="Filter søkeresultat" notBold>
          <Paragraph2
            $style={{
              fontSize: theme.sizing.scale600,
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            {filter ? 'Skjul filter' : 'Vis filter'}
          </Paragraph2>
        </Button>
      </Block>}
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
  label: (
    <SearchLabel name={kravName(t)} type={'Krav'} backgroundColor={searchResultColor.kravBackground} />
  ),
  type: ObjectType.Krav,
})

const behandlingMap = (t: Behandling) => ({
  id: t.id,
  sortKey: t.navn,
  label: (
    <SearchLabel name={behandlingName(t)} type={'Behandling'} backgroundColor={searchResultColor.behandlingBackground} />
  ),
  type: ObjectType.Behandling,
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
        label: (
          <SearchLabel name={c.shortName} type={typeName} />
        ),
        type: list,
      } as SearchItem),
    )
}

const searchCodelist = (search: string, list: ListName & NavigableItem, typeName: string, backgroundColor: string) =>
  codelist
    .getCodes(list)
    .filter((c) => c.shortName.toLowerCase().indexOf(search.toLowerCase()) >= 0)
    .map((c) => ({
      id: c.code,
      sortKey: c.shortName,
      label: (
        <SearchLabel name={c.shortName} type={typeName} backgroundColor={backgroundColor} />
      ),
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

    if (type === ListName.UNDERAVDELING && (search.length > 2)) {
      setSearchResult(getCodelist(search, ListName.UNDERAVDELING, 'Underavdeling'))
    } else {
      if (search && search.replace(/ /g, '').length > 2) {
        ; (async () => {
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
            searches.push((async () => add((await searchKrav(search)).map(kravMap)))())

            let kravNumber = search
            if (kravNumber[0].toLowerCase() === 'k') {
              kravNumber = kravNumber.substring(1)
            }

            if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 === 0) {
              searches.push((async () => add((await (await getKravByKravNummer(Number.parseFloat(kravNumber))).content).map(kravMap)))())
            }

            if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 !== 0) {
              const kravNummerMedVersjon = kravNumber.split('.')
              searches.push((async () => add([(await (await getKravByKravNumberAndVersion(kravNummerMedVersjon[0], kravNummerMedVersjon[1])))].map(kravMap)))())
            }

          }

          if (type === 'all' || type === ObjectType.Behandling) {
            searches.push((async () => add((await searchBehandling(search)).map(behandlingMap)))())
          }
          await Promise.all(searches)
          setLoading(false)
        })()
      }
    }
  }, [search, type])
  return [setSearch, searchResult, loading, type, setType] as [(text: string) => void, SearchItem[], boolean, SearchType, (type: SearchType) => void]
}

const MainSearch = () => {
  const searchParam = useQueryParam('search')
  const [setSearch, searchResult, loading, type, setType] = useMainSearch(searchParam)
  const [filterClicked, setFilterClicked] = useState<boolean>(false)
  const [value, setValue] = useState<Value>(searchParam ? [{ id: searchParam, label: searchParam }] : [])
  const location = useLocation()
  const history = useHistory()

  const getNoResultMessage = (): string => {
    if (!value.length || !value[0].id || (value[0].id && value[0].id.toString().length < 3)) {
      return 'Skriv minst tre bokstaver i søkefeltet.'
    } else if (!loading && !searchResult.length) {
      return `Ingen treff: ${value[0].id}`
    } else {
      return ''
    }
  }

  const filterOption = {
    id: 'filter',
    label:
      <Block>
        <SelectType type={type} setType={setType} />
        <Block display='flex' justifyContent='center' color={ettlevColors.green800} backgroundColor={ettlevColors.white} $style={{
          ...padding('24px', '24px'),
          paddingTop: '0px'
        }}>
          {getNoResultMessage()}
        </Block>
      </Block>,
    sortKey: 'filter',
    type: '__ungrouped',
  }
  const [groupedSeachResult, setGroupedSearchResult] = useState<GroupedResult>({ __ungrouped: [filterOption] })

  useEffect(() => {
    const groupedResults: GroupedResult = {
      __ungrouped: [],
      Krav: [],
      all: [],
      Behandling: [],
      Underavdeling: [],
    }

    if (value.length) {
      groupedResults.__ungrouped.push(filterOption)
    }

    searchResult.forEach((r: SearchItem) => {
      if (r.type === 'Krav') {
        groupedResults.Krav?.push(r)
      } else if (r.type === 'Behandling') {
        groupedResults.Behandling?.push(r)
      } else if (r.type === 'UNDERAVDELING') {
        groupedResults.Underavdeling?.push(r)
      } else {
        groupedResults.all?.push(r)
      }
    })

    setGroupedSearchResult(groupedResults)
  }, [searchResult])

  return (
    <Block width="100%">
      <Block id="search" display="flex" position="relative" alignItems="center" width={'100%'}>
        <CustomizedSelect
          clearable
          closeOnSelect={!filterClicked}
          size={SIZE.compact}
          backspaceRemoves
          startOpen={!!searchParam}
          noResultsMsg={<Block color={ettlevColors.green800}>Skriv minst tre bokstaver i søkefeltet.</Block>}
          autoFocus={location.pathname === '/'}
          isLoading={loading}
          maxDropdownHeight="400px"
          searchable
          type={TYPE.search}
          options={groupedSeachResult}
          placeholder={'Søk etter krav eller behandling'}
          aria-label={'Søk etter krav eller behandling'}
          value={value}
          onOpen={() => setFilterClicked(true)}
          onInputChange={(event) => {
            setSearch(event.currentTarget.value)
            setValue([{ id: event.currentTarget.value, label: event.currentTarget.value }])
          }}
          onChange={(params) => {
            const item = params.value[0] as SearchItem
              ; (async () => {
                if (item && item.type !== '__ungrouped') {
                  setValue([item])
                  history.push(urlForObject(item.type, item.id))
                  window.location.reload()
                } else if (item && item.type === '__ungrouped') {
                  setFilterClicked(true)
                }
              })()
          }}
          filterOptions={(options) => options}
          overrides={{
            SearchIcon: {
              component: () => <img src={searchIcon} alt="Søk ikon" />,
            },
            DropdownListItem: {
              style: {
                paddingTop: 0,
                paddingRight: '5px',
                paddingBottom: 0,
                paddingLeft: '5px',
              },
            },
            ClearIcon: {
              props: {
                overrides: {
                  Svg: {
                    component: () => (
                      <Button notBold size="compact" kind="tertiary" onClick={() => setValue([])}>
                        <img src={clearSearchIcon} alt="tøm" />
                      </Button>
                    ),
                  },
                },
              },
            },
          }}
        />
      </Block>
    </Block>
  )
}

export default MainSearch
