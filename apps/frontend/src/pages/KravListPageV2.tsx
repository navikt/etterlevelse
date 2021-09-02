import { Block, Responsive, Scale } from 'baseui/block'
import { H2, HeadingXXLarge, Label3, LabelSmall, Paragraph2, Paragraph4 } from 'baseui/typography'
import { useEffect, useState } from 'react'
import Button from '../components/common/Button'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import CustomizedTabs from '../components/common/CustomizedTabs'
import RouteLink from '../components/common/RouteLink'
import { user } from '../services/User'
import { theme } from '../util'
import moment from 'moment'
import { ettlevColors, maxPageWidth } from '../util/theme'
import { navChevronDownIcon, plusIcon } from '../components/Images'
import { useKravFilter } from '../api/KravGraphQLApi'
import { PanelLink } from '../components/common/PanelLink'
import { Spinner } from '../components/common/Spinner'
import { Notification } from 'baseui/notification'
import { emptyPage, KravListFilter, KravQL, KravStatus } from '../constants'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { kravStatus } from '../pages/KravPage'
import { codelist, ListName, LovCode } from '../services/Codelist'
import { Card } from 'baseui/card'
import { borderColor, borderRadius, borderStyle, borderWidth, margin, marginAll } from '../components/common/Style'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { Option, Select, SelectProps } from 'baseui/select'

type Section = 'siste' | 'alle'

const tabMarginBottom = '10px'

export const sortKrav = (kravene: KravQL[]) => {
  return [...kravene].sort((a, b) => {
    if (a.kravNummer === b.kravNummer) {
      return b.kravVersjon - a.kravVersjon
    } else {
      return a.kravNummer - b.kravNummer
    }
  })
}

const responsivePadding: Responsive<Scale> = ['16px', '16px', '16px', '100px', '100px', '100px']

export const KravListPage = () => (
  <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
    <Block width="100%" backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
      <Block maxWidth={maxPageWidth} width="100%">
        <Block paddingLeft={responsivePadding} paddingRight={responsivePadding} paddingTop={theme.sizing.scale800}>
          <CustomizedBreadcrumbs currentPage="Forvalte og opprette krav" />
          <Block display="flex" >
            <Block flex="1">
              <HeadingXXLarge marginTop='0' >Forvalte og opprette krav</HeadingXXLarge>
            </Block>

            <Block display="flex" justifyContent="flex-end">
              {user.isKraveier() && (
                <RouteLink hideUnderline href={'/krav/ny'}>
                  <Button startEnhancer={<img src={plusIcon} alt="" />} size="compact">Nytt krav</Button>
                </RouteLink>
              )}
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>

    <Block
      display={'flex'}
      justifyContent="center"
      width="100%"
      $style={{
        background: `linear-gradient(top, ${ettlevColors.grey50} 80px, ${ettlevColors.grey25} 0%)`,
      }}
    >
      <Block maxWidth={maxPageWidth} width="100%">
        <Block paddingLeft={responsivePadding} paddingRight={responsivePadding} paddingTop={theme.sizing.scale800}>
          <KravTabs />
        </Block>
      </Block>
    </Block>
  </Block>
)

const KravStatusView = ({ status }: { status: KravStatus }) => {
  const getStatusDisplay = (background: string, border: string) => (
    <Block width='fit-content'>
      <Card
        overrides={{
          Contents: {
            style: {
              ...marginAll('0px')
            },
          },
          Body: {
            style: {
              ...margin('2px', '8px')
            },
          },
          Root: {
            style: {
              // Did not use border, margin and border radius to remove warnings.
              backgroundColor: background,
              ...borderColor(border),
              ...borderWidth('1px'),
              ...borderStyle('solid'),
              ...borderRadius('4px'),
            },
          },
        }}
      >
        <Paragraph4 $style={{ color: ettlevColors.navMorkGra, ...marginAll('0px') }}>{kravStatus(status)}</Paragraph4>
      </Card>
    </Block>
  )

  if (status === KravStatus.UTKAST) {
    return getStatusDisplay('#FFECCC', '#D47B00')
  } else if (status === KravStatus.AKTIV) {
    return getStatusDisplay(ettlevColors.green50, ettlevColors.green400)
  } else if (status === KravStatus.UTGAATT) {
    return getStatusDisplay(ettlevColors.grey50, ettlevColors.grey200)
  } else {
    return getStatusDisplay('#FFECCC', '#D47B00')
  }
}

interface KravTema {
  tema: string
}

type CustomKravQL = KravQL & KravTema

const KravPanels = ({ kravene, loading }: { kravene: CustomKravQL[]; loading?: boolean }) => {
  if (loading) return <SkeletonPanel count={5} />
  return (
    <Block
      marginBottom={tabMarginBottom}
      $style={{
        ...borderWidth('1px'),
        ...borderColor(ettlevColors.grey100),
        ...borderStyle('solid'),
        ...borderRadius('4px'),
        backgroundColor: 'white'
      }}>
      {kravene.map((k) => {
        return (
          <Block key={k.id} marginBottom={'0px'}>
            <PanelLink
              useUnderline
              href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
              title={<Paragraph2 $style={{ fontSize: '16px', marginBottom: '0px', marginTop: '0px' }}>K{k.kravNummer}.{k.kravVersjon}</Paragraph2>}
              beskrivelse={<Label3 $style={{ fontSize: '22px', lineHeight: '28px' }}>{k.navn}</Label3>}
              rightBeskrivelse={!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}
              rightTitle={k.tema ? k.tema : ''}
              statusText={<KravStatusView status={k.status} />}
              overrides={{
                Block: {
                  style: {
                    ':hover': { boxShadow: 'none' },
                    ...borderStyle('hidden'),
                    borderBottomStyle: 'solid'
                  }
                }
              }}
            />
          </Block>
        )
      })}
    </Block>
  )
}

const KravTabs = () => {
  const [tab, setTab] = useState<Section>('siste')

  return (
    <CustomizedTabs
      fontColor={ettlevColors.green800}
      small
      backgroundColor={ettlevColors.grey25}
      activeKey={tab}
      onChange={(args) => setTab(args.activeKey as Section)}
      tabs={[
        {
          key: 'siste',
          title: 'Sist endret av meg',
          content: <SistRedigertKrav />,
        },
        {
          key: 'alle',
          title: 'Seksjonens krav',
          content: <AllKrav />,
        }
      ]}
    />
  )
}

const SistRedigertKrav = () => {
  const res = useKravFilter({
    sistRedigert: 10,
    gjeldendeKrav: false,
    pageNumber: 0,
    pageSize: 10,
  })

  const { variables, data, loading, error } = res

  const sortedData = sortKrav(data?.krav.content || [])

  const sortedDataWithTema: CustomKravQL[] = []
  sortedData.forEach((k) => {
    const lov = codelist.getCode(ListName.LOV, k.regelverk[0]?.lov?.code)
    const tema = codelist.getCode(ListName.TEMA, lov?.data?.tema)
    sortedDataWithTema.push({ ...k, tema: tema?.shortName ? tema?.shortName : '' })
  })

  return loading && !data?.krav?.numberOfElements ? (
    <Spinner size={theme.sizing.scale2400} />
  ) : error ? (
    <Notification kind={'negative'}>{JSON.stringify(error, null, 2)}</Notification>
  ) : (
    <Block>
      <Block>
        <H2>{sortedData.length ? sortedData.length : 0} Krav</H2>
      </Block>
      <KravPanels kravene={sortedDataWithTema} loading={loading} />
    </Block>
  )
}

type KravFilter = {
  status: Option[]
  relevans: Option[]
  tema: Option[]
  lover: Option[]
}

const KravFilterSelect = (props: SelectProps) => {
  return <Select {...props} overrides={{
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
    DropdownListItem: {
      style: {
        fontSize: '18px',
        wordBreak: 'break-all'
      },
    },
  }} />
}

const AllKrav = () => {
  const pageSize = 20
  const [pageNumber, setPage] = useState(0)

  const [filter, setFilter] = useState<KravFilter>({ status: [], relevans: [], tema: [], lover: [] })
  const [temaFilter, setTemaFilter] = useState<string[]>([])
  const relevans = codelist.getCodes(ListName.RELEVANS)
  const temaer = codelist.getCodes(ListName.TEMA)
  const lover = codelist.getCodes(ListName.LOV)
  const [loverFilter, setLoverFilter] = useState(lover)

  const { data, loading: gqlLoading, fetchMore, error, refetch } = useKravFilter({
    relevans: filter.relevans.length && filter.relevans[0].id ? [filter.relevans[0].id?.toString()] : undefined,
    lover: filter.lover.length && filter.lover[0].id ? [filter.lover[0].id.toString()] : temaFilter.length ? temaFilter : undefined,
    status: filter.status.length && filter.status[0].id ? filter.status[0].id.toString() : undefined,
    pageNumber: 0,
    pageSize,
  })
  const [sortedKravList, setSortedKravList] = useState<CustomKravQL[]>([])

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

  const sortKravByTema = (kravList: KravQL[]) => {
    const sortedDataWithTema: CustomKravQL[] = []
    kravList.forEach((k) => {
      const lov = codelist.getCode(ListName.LOV, k.regelverk[0]?.lov?.code)
      const tema = codelist.getCode(ListName.TEMA, lov?.data?.tema)
      sortedDataWithTema.push({ ...k, tema: tema?.shortName ? tema?.shortName : '' })
    })

    sortedDataWithTema.sort((a, b) => {
      if (a.tema === '' || a.tema === null) return 1
      if (b.tema === '' || b.tema === null) return -1
      if (a.tema === b.tema) return 0
      return a.tema < b.tema ? -1 : 1
    })
    return sortedDataWithTema
  }

  useEffect(() => {
    const sortedData = sortKrav(kravene.content || [])
    setSortedKravList(sortKravByTema(sortedData))
  }, [data])

  useEffect(() => {
    if (filter.tema.length && filter.tema[0].id) {
      const temaLover: string[] = []
      const gyldiglover: LovCode[] = []
      lover.forEach((l) => {
        if (l.data?.tema === filter.tema[0].id) {
          temaLover.push(l.code)
          gyldiglover.push(l)
        }
      })
      setTemaFilter(temaLover)
      setLoverFilter(gyldiglover)
    } else {
      setTemaFilter([])
      setLoverFilter(lover)
    }
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



  const kravene = data?.krav || emptyPage

  return loading && !kravene.numberOfElements ? (
    <Spinner size={theme.sizing.scale2400} />
  ) : error ? (
    <Notification kind={'negative'}>{JSON.stringify(error, null, 2)}</Notification>
  ) : (
    <Block>
      <Block display="flex" width="100%" justifyContent="center" marginTop="20px" marginBottom="20px">
        <Block flex="1">
          <H2 marginTop="0px" marginBottom="0px">{sortedKravList.length ? sortedKravList.length : 0} Krav</H2>
        </Block>
        <Block display="flex" alignItems="center">
          <Label3>Filter:</Label3>
          <Block marginLeft="12px" width="100%" minWidth="170px">
            <KravFilterSelect
              size="compact"
              placeholder="relevans"
              options={relevans?.map((r) => {
                return { label: r.shortName, id: r.code }
              })}
              value={filter.relevans}
              onChange={(params) =>
                updateFilter(params.value, KravListFilter.RELEVANS)
              }
            />
          </Block>
          <Block marginLeft="12px" width="100%" minWidth="200px">
            <KravFilterSelect
              size="compact"
              placeholder="tema"
              options={temaer?.map((t) => {
                return { label: t.shortName, id: t.code }
              })}
              value={filter.tema}
              onChange={(params) =>
                updateFilter(params.value, KravListFilter.TEMAER)
              }
            />
          </Block>
          <Block marginLeft="12px" width="100%" minWidth="200px">
            <KravFilterSelect
              size="compact"
              placeholder="lover"
              options={loverFilter?.map((t) => {
                return { label: t.shortName, id: t.code }
              })}
              value={filter.lover}
              onChange={(params) =>
                updateFilter(params.value, KravListFilter.LOVER)
              }
            />
          </Block>
          <Block marginLeft="12px" width="100%" minWidth="150px">
            <KravFilterSelect
              size="compact"
              placeholder="Status"
              options={[{id: KravStatus.AKTIV, label: 'Aktiv'},{id: KravStatus.UNDER_ARBEID, label: 'Under Arbeid'},{id: KravStatus.UTGAATT, label: 'Utgått'},{id: KravStatus.UTKAST, label: 'Utkast'},]}
              value={filter.status}
              onChange={(params) =>
                updateFilter(params.value, KravListFilter.STATUS)
              }
            />
          </Block>
        </Block>
      </Block>
      <KravPanels kravene={sortedKravList} loading={loading} />

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