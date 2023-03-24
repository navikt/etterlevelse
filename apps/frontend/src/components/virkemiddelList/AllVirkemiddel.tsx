import { useEffect, useState } from 'react'
import { codelist, ListName } from '../../services/Codelist'
import { useKravFilter } from '../../api/KravGraphQLApi'
import { emptyPage, KravListFilter, KravQL, KravStatus, VirkemiddelListFilter } from '../../constants'
import { Block, Responsive, Scale } from 'baseui/block'
import { Option, SelectOverrides } from 'baseui/select'
import CustomizedSelect from '../common/CustomizedSelect'
import { ettlevColors, theme } from '../../util/theme'
import { Spinner } from '../common/Spinner'
import { HeadingXLarge, LabelSmall, ParagraphMedium } from 'baseui/typography'
import { KravPanels } from '../../pages/KravListPage'
import { borderColor, borderWidth } from '../common/Style'
import { useVirkemiddelFilter } from '../../api/VirkemiddelApi'
import { useDebouncedState } from '../../util/hooks'
import { StatefulInput } from 'baseui/input'
import Button from '../common/Button'
import { clearSearchIcon, searchIcon } from '../Images'

type VirkemiddelFilter = {
  virkemiddelType: Option[]
  sort: Option[],
}

const selectorMarginLeft: Responsive<Scale> = ['0px', '0px', '0px', '12px', '12px', '12px']
const selectorMarginTop: Responsive<Scale> = ['10px', '10px', '10px', '0px', '0px', '0px']

export const AllVirkemiddel = () => {
  const getSortDateOptions = [{ label: 'sorter på navn', id: 'navn' }, { label: 'nyest-eldst', id: 'DESC' }, { label: 'eldst-nyest', id: 'ASC' }]
  const [filter, setFilter] = useState<VirkemiddelFilter>({
    virkemiddelType: [{ label: 'Alle virkemiddel typer', id: 'alle' }],
    sort: [getSortDateOptions[0]],
  })
  const [sok, setSok] = useDebouncedState('', 300)
  const [hover, setHover] = useState(false)
  const virkemiddelTyper = codelist.getCodes(ListName.VIRKEMIDDELTYPE)
  const getOptions = (label: string, options: any[]) => [{ label: label, id: 'alle' }, ...options]

  const [data, totalDataLength, setVirkemiddelTypeFilter, setSortDate, loading] = useVirkemiddelFilter()

  const filteredVirkemiddel = sok && sok.length > 2 ? data.filter((v) => v.navn.includes(sok)) : data

  const updateFilter = (value: any, type: VirkemiddelListFilter) => {
    const newFilterValue = { ...filter }
    if (type === VirkemiddelListFilter.VIRKEMIDDELTYPE) {
      newFilterValue.virkemiddelType = value
    }
    if (type === VirkemiddelListFilter.SORTDATE) {
      newFilterValue.sort = value
    }
    setFilter(newFilterValue)
  }

  useEffect(() => {
    setVirkemiddelTypeFilter(filter.virkemiddelType[0].id?.toString() || '')
    if (filter.sort[0].id?.toString() !== 'navn') {
      setSortDate(filter.sort[0].id?.toString() || '')
    } else {
      setSortDate('')
    }
  }, [filter])

  //must be run in function to not affect other selectors others overrides
  const getSelector = (filterId: string | undefined, virkemiddelFilter: VirkemiddelListFilter, options: any[], value: Option[]) => {
    const customSelectOverrides: SelectOverrides = {
      Root: {
        style: {
          width: '150px',
        },
      },
      DropdownContainer: {
        style: {
          width: 'fit-content',
          maxWidth: '300px',
        },
      },
    }

    return (
      <Block marginLeft={selectorMarginLeft} marginTop={selectorMarginTop}>
        <CustomizedSelect
          key={'krav_filter_' + virkemiddelFilter}
          clearable={false}
          size="compact"
          placeholder="tema"
          options={options}
          overrides={{
            ...customSelectOverrides,
            ControlContainer: {
              style: {
                backgroundColor: filterId === 'alle' ? ettlevColors.white : ettlevColors.green50,
                ...borderColor(filterId === 'alle' ? ettlevColors.grey200 : ettlevColors.green800),
              },
            },
          }}
          value={value}
          onChange={(params) => updateFilter(params.value, virkemiddelFilter)}
        />
      </Block>
    )
  }

  return loading ? (
    <Spinner size={theme.sizing.scale2400} />
  ) : (
    <Block>
      <Block width="100%" justifyContent="center" marginTop="20px" marginBottom="20px">
        <Block display="flex" justifyContent="flex-start" width="100%" marginBottom="6px">
          <HeadingXLarge marginTop="0px" marginBottom="0px">
            {totalDataLength} Virkemiddel
          </HeadingXLarge>
        </Block>
        <Block display={['block', 'block', 'block', 'block', 'block', 'flex']} justifyContent="center" alignContent="center" width="100%">
          <Block display="flex" justifyContent="flex-start" width="100%"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}>
            <StatefulInput
              size="compact"
              placeholder="Søk"
              aria-label={'Søk'}
              onChange={(e) => setSok((e.target as HTMLInputElement).value)}
              clearable
              overrides={{
                Root: { style: { paddingLeft: 0, paddingRight: 0, ...borderWidth('1px') } },
                Input: {
                  style: {
                    backgroundColor: hover ? ettlevColors.green50 : undefined,
                  },
                },
                StartEnhancer: {
                  style: {
                    backgroundColor: hover ? ettlevColors.green50 : undefined,
                  },
                },
                ClearIconContainer: {
                  style: {
                    backgroundColor: hover ? ettlevColors.green50 : undefined,
                  },
                },
                ClearIcon: {
                  props: {
                    overrides: {
                      Svg: {
                        component: (props: any) => (
                          <Button notBold size="compact" kind="tertiary" onClick={() => props.onClick()}>
                            <img src={clearSearchIcon} alt="tøm" />
                          </Button>
                        ),
                      },
                    },
                  },
                },
              }}
              startEnhancer={<img src={searchIcon} alt="Søk ikon" />}
            />

          </Block>
          <Block display="flex" justifyContent="flex-end" width="100%" alignItems="center">
            <Block display={['block', 'block', 'block', 'block', 'flex', 'flex']} alignItems="center" justifyContent="flex-end" width="100%">
              <LabelSmall>Filter</LabelSmall>
              {getSelector(
                filter.virkemiddelType[0].id?.toString(),
                VirkemiddelListFilter.VIRKEMIDDELTYPE,
                getOptions(
                  'Alle virkemiddel typer',
                  virkemiddelTyper?.map((r) => {
                    return { label: r.shortName, id: r.code }
                  }),
                ),
                filter.virkemiddelType,
              )}
              {getSelector(filter.sort[0].id?.toString(), VirkemiddelListFilter.SORTDATE, getSortDateOptions, filter.sort)}
            </Block>
          </Block>
        </Block>
      </Block>
      {/* <KravPanels kravene={sortedKravList} loading={loading} /> */}
      {filteredVirkemiddel.length === 0 && (
        <Block width="100%" display="flex" justifyContent="center">
          <ParagraphMedium>Fant ingen virkemiddel</ParagraphMedium>
        </Block>
      )}

      {!loading && totalDataLength !== 0 && (
        <Block display={'flex'} justifyContent={'space-between'} marginTop={theme.sizing.scale1000}>
          <LabelSmall marginRight={theme.sizing.scale400}>
            Viser {filteredVirkemiddel.length}/{totalDataLength}
          </LabelSmall>
        </Block>
      )}
    </Block>
  )
}
