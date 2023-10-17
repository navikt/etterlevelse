import { useEffect, useState } from 'react'
import { codelist, ListName } from '../../services/Codelist'
import { VirkemiddelListFilter } from '../../constants'
import { Block, Responsive, Scale } from 'baseui/block'
import { Option } from 'baseui/select'
import CustomizedSelect from '../common/CustomizedSelect'
import { ettlevColors, theme } from '../../util/theme'
import { HeadingXLarge, LabelSmall, ParagraphMedium } from 'baseui/typography'
import { borderColor, borderWidth } from '../common/Style'
import { useVirkemiddelFilter } from '../../api/VirkemiddelApi'
import { useDebouncedState } from '../../util/hooks'
import { StatefulInput } from 'baseui/input'
import Button from '../common/Button'
import { clearSearchIcon, searchIcon } from '../Images'
import { VirkemiddelTable } from './VirkemiddelTable'
import { EditVirkemiddelModal } from '../virkemiddel/edit/EditVirkemiddelModal'
import { Loader } from '@navikt/ds-react'

type VirkemiddelFilter = {
  virkemiddelType: Option[]
  sort: Option[]
}

type AllVirkemiddelProps = {
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (b: boolean) => void
}

const selectorMarginLeft: Responsive<Scale> = ['0px', '0px', '0px', '12px', '12px', '12px']
const selectorMarginTop: Responsive<Scale> = ['10px', '10px', '10px', '0px', '0px', '0px']

export const AllVirkemiddel = ({ isCreateModalOpen, setIsCreateModalOpen }: AllVirkemiddelProps) => {
  const getSortDateOptions = [
    { label: 'sorter på navn', id: 'navn' },
    { label: 'nyest-eldst', id: 'DESC' },
    { label: 'eldst-nyest', id: 'ASC' },
  ]
  const [filter, setFilter] = useState<VirkemiddelFilter>({
    virkemiddelType: [{ label: 'Alle virkemiddel typer', id: 'alle' }],
    sort: [getSortDateOptions[0]],
  })
  const [sok, setSok] = useDebouncedState('', 300)
  const [hover, setHover] = useState(false)
  const virkemiddelTyper = codelist.getCodes(ListName.VIRKEMIDDELTYPE)
  const getOptions = (label: string, options: any[]) => [{ label: label, id: 'alle' }, ...options]

  const [data, totalDataLength, setVirkemiddelTypeFilter, loading, refetchData] = useVirkemiddelFilter()

  const filteredVirkemiddel = sok && sok.length > 2 ? data.filter((v) => v.navn.includes(sok)) : data

  const updateFilter = (value: any, type: VirkemiddelListFilter) => {
    const newFilterValue = { ...filter }
    if (type === VirkemiddelListFilter.VIRKEMIDDELTYPE) {
      newFilterValue.virkemiddelType = value
    }
    setFilter(newFilterValue)
  }

  useEffect(() => {
    setVirkemiddelTypeFilter(filter.virkemiddelType[0].id?.toString() || '')
  }, [filter])

  //must be run in function to not affect other selectors others overrides
  const getSelector = (filterId: string | undefined, virkemiddelFilter: VirkemiddelListFilter, options: any[], value: Option[]) => {
    return (
      <Block marginLeft={selectorMarginLeft} marginTop={selectorMarginTop}>
        <CustomizedSelect
          key={'virkemiddel_filter_' + virkemiddelFilter}
          clearable={false}
          size="compact"
          placeholder="tema"
          options={options}
          overrides={{
            Root: {
              style: {
                minWidth: '200px',
              },
            },
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
    <Loader size="large" />
  ) : (
    <Block>
      <Block width="100%" justifyContent="center" marginTop="20px" marginBottom="20px">
        <Block display="flex" justifyContent="flex-start" width="100%" marginBottom="6px">
          <HeadingXLarge marginTop="0px" marginBottom="0px">
            {totalDataLength} Virkemiddel
          </HeadingXLarge>
        </Block>
        <Block display="flex" justifyContent="center" alignContent="center" width="100%">
          <Block display="flex" justifyContent="flex-start" width="100%" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
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
            </Block>
          </Block>
        </Block>
      </Block>
      <VirkemiddelTable virkemidler={filteredVirkemiddel} loading={loading} refetchData={refetchData} />
      {filteredVirkemiddel.length === 0 && (
        <Block width="100%" display="flex" justifyContent="center">
          <ParagraphMedium>Fant ingen virkemiddel</ParagraphMedium>
        </Block>
      )}

      <EditVirkemiddelModal isOpen={isCreateModalOpen} setIsOpen={setIsCreateModalOpen} refetchData={refetchData} />
    </Block>
  )
}
