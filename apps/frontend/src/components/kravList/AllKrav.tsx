import { useEffect, useState } from "react";
import { codelist, ListName, LovCode } from "../../services/Codelist";
import { useKravFilter } from "../../api/KravGraphQLApi";
import { emptyPage, KravListFilter, KravQL, KravStatus } from "../../constants";
import { Block, Responsive, Scale } from "baseui/block";
import { Option, SelectOverrides } from "baseui/select";
import CustomizedSelect from "../common/CustomizedSelect";
import { ettlevColors, theme } from "../../util/theme";
import { Spinner } from "../common/Spinner";
import { Notification } from "baseui/notification";
import { H2, Label3, LabelSmall, Paragraph2 } from "baseui/typography";
import Button from "../common/Button";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { KravPanels, sortKrav } from "../../pages/KravListPageV2";

type KravFilter = {
  status: Option[]
  relevans: Option[]
  tema: Option[]
  lover: Option[]
}


export const AllKrav = () => {
  const pageSize = 20
  const [pageNumber, setPage] = useState(0)
  const [sorting, setSorting] = useState('sist')
  const [filter, setFilter] = useState<KravFilter>({
    status: [{ label: 'Alle statuser', id: 'alle' }],
    relevans: [{ label: 'Alle relevans', id: 'alle' }],
    tema: [{ label: 'Alle tema', id: 'alle' }],
    lover: [{ label: 'Alle lover', id: 'alle' }],
  })

  // USIKKERT OM VI SKAL FILTRERER BASERT PÅ TEMA
  // const [temaFilter, setTemaFilter] = useState<string[]>([])
  // const temaer = codelist.getCodes(ListName.TEMA)

  const relevans = codelist.getCodes(ListName.RELEVANS)
  const lover = codelist.getCodes(ListName.LOV)

  // BRUKER KUN NÅR VI SKAL FILTRERE PÅ TEMA
  // const [loverFilter, setLoverFilter] = useState(lover)

  const {
    data,
    loading: gqlLoading,
    fetchMore,
    error,
    refetch,
  } = useKravFilter({
    relevans: filter.relevans[0]?.id === 'alle' ? undefined : filter.relevans.map((r) => (r.id ? r.id.toString() : '')),
    // lover: filter.lover[0].id === 'alle' && filter.tema[0].id === 'alle' ? undefined : filter.lover[0].id !== 'alle' ? filter.lover.map((l) => (l.id ? l.id.toString() : '')) : temaFilter,
    lover: filter.lover[0].id === 'alle' ? undefined : filter.lover.map((l) => (l.id ? l.id.toString() : '')),
    status: filter.status[0]?.id === 'alle' ? undefined : filter.status.map((s) => (s.id ? s.id?.toString() : '')),
    pageNumber: 0,
    pageSize,
  })
  const [sortedKravList, setSortedKravList] = useState<KravQL[]>([])

  const loading = !data && gqlLoading
  const lastMer = () => {
    fetchMore({
      variables: {
        pageNumber: data!.krav.pageNumber + 1,
        pageSize,
      },
      updateQuery: (p, o) => {
        const oldData = p.krav
        const newData = o.fetchMoreResult!.krav
        return {
          krav: {
            ...oldData,
            pageNumber: newData.pageNumber,
            numberOfElements: oldData.numberOfElements + newData.numberOfElements,
            content: [...oldData.content, ...newData.content],
          },
        }
      },
    }).catch((e) => console.error(e))
  }

  useEffect(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) => (a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0))
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [data])

  useEffect(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) => (a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0))
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [sorting])

  useEffect(() => {
    // USIKKERT OM VI SKAL FILTRERER BASERT PÅ TEMA
    // if (filter.tema[0].id !== 'alle') {
    //   const temaLover: string[] = []
    //   const gyldiglover: LovCode[] = []
    //   lover.forEach((l) => {
    //     if (l.data?.tema === filter.tema[0].id) {
    //       temaLover.push(l.code)
    //       gyldiglover.push(l)
    //     }
    //   })
    //   setTemaFilter(temaLover)
    //   setLoverFilter(gyldiglover)
    // } else {
    //   setTemaFilter([])
    //   setLoverFilter(lover)
    // }

    refetch()
  }, [filter])

  const updateFilter = (value: any, type: KravListFilter) => {
    const newFilterValue = { ...filter }
    if (type === KravListFilter.RELEVANS) {
      newFilterValue.relevans = value
    }
    if (type === KravListFilter.LOVER) {
      newFilterValue.lover = value
    }
    if (type === KravListFilter.STATUS) {
      newFilterValue.status = value
    }
    if (type === KravListFilter.TEMAER) {
      newFilterValue.tema = value
    }
    setFilter(newFilterValue)
  }

  const selectorMarginLeft: Responsive<Scale> = ['0px', '0px', '0px', '12px', '12px', '12px']
  const selectorMarginTop: Responsive<Scale> = ['10px', '10px', '10px', '0px', '0px', '0px']

  const kravene = data?.krav || emptyPage

  const getOptions = (label: string, options: any[]) => [{ label: label, id: 'alle' }, ...options]

  const getLovOptions = () => {
    return getOptions(
      'Alle lover',
      lover.map((l) => {
        return { label: l.shortName, id: l.code }
      }),
    )

    // BRUKER KUN NÅR VI SKAL FILTRERE PÅ TEMA
    // if (filter.tema[0].id === 'alle') {
    //   return getOptions(
    //     'Alle lover',
    //     lover.map((l) => {
    //       return { label: l.shortName, id: l.code }
    //     }),
    //   )
    // } else {  
    //   return getOptions(
    //     'Alle lover',
    //     loverFilter?.map((t) => {
    //       return { label: t.shortName, id: t.code }
    //     }),
    //   )
    // }

  }

  //must be run in function to not affect other selectors others overrides
  const getSelector = (filterId: string | undefined, kravFilter: KravListFilter, options: any[], value: Option[]) => {

    const customSelectOverrides: SelectOverrides = {
      Root: {
        style: {
          width: '150px',
        }
      },
      DropdownContainer: {
        style: {
          width: 'fit-content',
          maxWidth: '300px'
        }
      }
    }

    return (
      <Block marginLeft={selectorMarginLeft} marginTop={selectorMarginTop}>
        <CustomizedSelect
          key={'krav_filter_' + kravFilter}
          clearable={false}
          size="compact"
          placeholder="tema"
          options={options}
          overrides={
            {
              ...customSelectOverrides,
              ControlContainer: {
                style: {
                  backgroundColor: filterId === 'alle' ? ettlevColors.white : ettlevColors.green50,
                  borderColor: filterId === 'alle' ? ettlevColors.grey200 : ettlevColors.green800,
                }
              }
            }
          }
          value={value}
          onChange={(params) => updateFilter(params.value, kravFilter)}
        />
      </Block>
    )
  }

  return loading && !kravene.numberOfElements ? (
    <Spinner size={theme.sizing.scale2400} />
  ) : error ? (
    <Notification kind={'negative'}>{JSON.stringify(error, null, 2)}</Notification>
  ) : (
    <Block>
      <Block width="100%" justifyContent="center" marginTop="20px" marginBottom="20px">

        <Block display={['block', 'block', 'block', 'block', 'block', 'flex',]} justifyContent="center" alignContent="center" width="100%">
          <Block display="flex" justifyContent="flex-start" width="100%">
            <H2 marginTop="0px" marginBottom="0px">
              {kravene.totalElements ? kravene.totalElements : 0} Krav
            </H2>
          </Block>
          <Block display="flex" justifyContent="flex-end" width="100%" alignItems="center">
            <Block display={['block', 'block', 'block', 'block', 'flex', 'flex',]} alignItems="center" justifyContent="flex-start" width="100%">
              <Label3>Filter</Label3>
              {/* {getSelector(filter.tema[0].id?.toString(), KravListFilter.TEMAER, getOptions(
                'Alle tema',
                temaer?.map((t) => {
                  return { label: t.shortName, id: t.code }
                }),
              ), filter.tema)} */}
              {getSelector(filter.relevans[0].id?.toString(), KravListFilter.RELEVANS, getOptions(
                'Alle relevans',
                relevans?.map((r) => {
                  return { label: r.shortName, id: r.code }
                }),
              ), filter.relevans)}
              {getSelector(filter.lover[0].id?.toString(), KravListFilter.LOVER, getLovOptions(), filter.lover)}
              {getSelector(filter.status[0].id?.toString(), KravListFilter.STATUS, getOptions('Alle statuser', [
                { id: KravStatus.AKTIV, label: 'Aktiv' },
                { id: KravStatus.UNDER_ARBEID, label: 'Under Arbeid' },
                {
                  id: KravStatus.UTGAATT,
                  label: 'Utgått',
                },
                { id: KravStatus.UTKAST, label: 'Utkast' },
              ]), filter.status)}
            </Block>

            {/*
            <Block >
              <Label3>Sorter:</Label3>
            </Block>
            <Block marginLeft="17px">
              <RadioGroup
                align={ALIGN.horizontal}
                value={sorting}
                onChange={e => setSorting(e.currentTarget.value)}
                name="sorting"
              >
                <Radio value='sist'>
                  Sist endret
                </Radio>
                <Radio value='alfabetisk'>
                  Alfabetisk
                </Radio>
              </RadioGroup>
            </Block>
                      */}
          </Block>
        </Block>
      </Block>
      <KravPanels kravene={sortedKravList} loading={loading} />
      {sortedKravList.length === 0 && (
        <Block width="100%" display="flex" justifyContent="center">
          <Paragraph2>Fant ingen krav</Paragraph2>
        </Block>
      )}

      {!loading && kravene.totalElements !== 0 && (
        <Block display={'flex'} justifyContent={'space-between'} marginTop={theme.sizing.scale1000}>
          <Block display="flex" alignItems="center">
            <Button onClick={lastMer} icon={faPlus} kind={'secondary'} size="compact" disabled={gqlLoading || kravene.numberOfElements >= kravene.totalElements}>
              Last mer
            </Button>

            {gqlLoading && (
              <Block marginLeft={theme.sizing.scale400}>
                <Spinner size={theme.sizing.scale800} />
              </Block>
            )}
          </Block>
          <LabelSmall marginRight={theme.sizing.scale400}>
            Viser {kravene.numberOfElements}/{kravene.totalElements}
          </LabelSmall>
        </Block>
      )}
    </Block>
  )
}
