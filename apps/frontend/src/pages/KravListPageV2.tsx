import { Block, Display, Responsive, Scale } from 'baseui/block'
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
import { plusIcon } from '../components/Images'
import { useKravFilter } from '../api/KravGraphQLApi'
import { PanelLink } from '../components/common/PanelLink'
import { Spinner } from '../components/common/Spinner'
import { Notification } from 'baseui/notification'
import { emptyPage, KravListFilter, KravQL, KravStatus } from '../constants'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { kravStatus } from '../pages/KravPage'
import { codelist, ListName } from '../services/Codelist'
import { Card } from 'baseui/card'
import { borderColor, borderRadius, borderStyle, borderWidth, margin, marginAll, padding } from '../components/common/Style'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { Option } from 'baseui/select'
import CustomizedSelect from '../components/common/CustomizedSelect'
import { ALIGN, Radio, RadioGroup } from 'baseui/radio'

type Section = 'siste' | 'alle'

const tabMarginBottom = '10px'
const responsiveDisplay: Responsive<Display> = ['block', 'block', 'block', 'flex', 'flex', 'flex']

export const sortKrav = (kravene: KravQL[]) => {
  return [...kravene].sort((a, b) => {
    if (a.navn.toLocaleLowerCase() === b.navn.toLocaleLowerCase()) {
      return b.kravVersjon - a.kravVersjon
    }
    if (a.navn.toLocaleLowerCase() < b.navn.toLocaleLowerCase()) return -1
    if (a.navn.toLocaleLowerCase() > b.navn.toLocaleLowerCase()) return 1
    return 0
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

const KravPanels = ({ kravene, loading }: { kravene: KravQL[]; loading?: boolean }) => {
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
      {kravene.map((k, index) => {
        const lov = codelist.getCode(ListName.LOV, k.regelverk[0]?.lov?.code)
        const tema = codelist.getCode(ListName.TEMA, lov?.data?.tema)
        return (
          <Block key={k.id} marginBottom={'0px'}>
            {
              index !== 0 && (
                <Block width="100%" display="flex" justifyContent="center">
                  <Block display="flex" width="98%" height="1px" backgroundColor={ettlevColors.grey100} />
                </Block>
              )
            }
            <PanelLink
              useUnderline
              href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
              title={<Paragraph2 $style={{ fontSize: '16px', marginBottom: '0px', marginTop: '0px' }}>K{k.kravNummer}.{k.kravVersjon}</Paragraph2>}
              beskrivelse={<Label3 $style={{ fontSize: '18px', lineHeight: '28px' }}>{k.navn}</Label3>}
              rightBeskrivelse={!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}
              rightTitle={tema && tema.shortName ? tema.shortName : ''}
              statusText={<KravStatusView status={k.status} />}
              overrides={{
                Block: {
                  style: {
                    ':hover': { boxShadow: 'none' },
                    ...borderStyle('hidden'),
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
  const [sorting, setSorting] = useState('sist')
  const [sortedKravList, setSortedKravList] = useState<KravQL[]>([])
  const res = useKravFilter({
    sistRedigert: 10,
    gjeldendeKrav: false,
    pageNumber: 0,
    pageSize: 10,
  })

  const { variables, data, loading, error } = res

  const kravene = data?.krav || emptyPage

  useEffect(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) =>
        a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0
      )
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [data])

  useEffect(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) =>
        a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0
      )
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [sorting])

  return loading && !data?.krav?.numberOfElements ? (
    <Spinner size={theme.sizing.scale2400} />
  ) : error ? (
    <Notification kind={'negative'}>{JSON.stringify(error, null, 2)}</Notification>
  ) : (
    <Block>
      <Block
        display={responsiveDisplay}
        justifyContent='center'
        alignContent='center'
        width="100%"
        marginTop="20px"
        marginBottom="20px"
      >
        <Block display="flex" justifyContent="flex-start" width="100%">
          <H2 marginTop="0px" marginBottom="0px">{sortedKravList.length ? sortedKravList.length : 0} Krav</H2>
        </Block>
        <Block display="flex" justifyContent="flex-end" width="100%" alignItems="center">
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
        </Block>
      </Block>
      <KravPanels kravene={sortedKravList} loading={loading} />
    </Block>
  )
}

type KravFilter = {
  status: Option[]
  relevans: Option[]
  tema: Option[]
  lover: Option[]
}

const AllKrav = () => {
  const pageSize = 20
  const [pageNumber, setPage] = useState(0)
  const [sorting, setSorting] = useState('sist')
  const [filter, setFilter] = useState<KravFilter>({ status: [], relevans: [], tema: [], lover: [] })
  // USIKKERT OM VI SKAL FILTRERER BASERT PÅ TEMA
  // const [temaFilter, setTemaFilter] = useState<string[]>([])
  // const temaer = codelist.getCodes(ListName.TEMA)

  const relevans = codelist.getCodes(ListName.RELEVANS)
  const lover = codelist.getCodes(ListName.LOV)

  // BRUKER KUN NÅR VI SKAL FILTRERE PÅ TEMA
  // const [loverFilter, setLoverFilter] = useState(lover)

  const { data, loading: gqlLoading, fetchMore, error, refetch } = useKravFilter({
    relevans: filter.relevans.length ? filter.relevans.map((r) => r.id ? r.id.toString() : '') : undefined,
    lover: filter.lover.length ? filter.lover.map((l) => l.id ? l.id.toString() : '') : undefined,
    status: filter.status.length ? filter.status.map((s) => s.id ? s.id?.toString() : '') : undefined,
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
      sortedData.sort((a, b) =>
        a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0
      )
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [data])

  useEffect(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) =>
        a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0
      )
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [sorting])

  useEffect(() => {
    // USIKKERT OM VI SKAL FILTRERER BASERT PÅ TEMA
    //
    // if (filter.tema.length && filter.tema[0].id) {
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

  return loading && !kravene.numberOfElements ? (
    <Spinner size={theme.sizing.scale2400} />
  ) : error ? (
    <Notification kind={'negative'}>{JSON.stringify(error, null, 2)}</Notification>
  ) : (
    <Block>
      <Block width="100%" justifyContent="center" marginTop="20px" marginBottom="20px">
        <Block
          display={responsiveDisplay}
          alignItems="center"
          marginBottom="20px"
          width="calc(100% - 62px)"
          $style={
            {
              ...borderColor(ettlevColors.grey100),
              ...borderStyle('solid'),
              ...borderWidth('1px'),
              backgroundColor: ettlevColors.white,
              ...padding('23px', '31px')
            }
          }
        >
          <Block display={responsiveDisplay} alignItems="center" justifyContent='flex-start' width="100%">
            <Label3>Filter:</Label3>
            <Block marginLeft={selectorMarginLeft} marginTop={selectorMarginTop} width="100%" minWidth="170px">
              <CustomizedSelect
                clearable={false}
                size="compact"
                placeholder="relevans"
                options={relevans?.map((r) => {
                  return { label: r.shortName, id: r.code }
                })}
                value={filter.relevans}
                overrides={{
                  DropdownListItem: {
                    style: {
                      wordBreak: 'break-all'
                    },
                  },
                  Tag: {
                    props: {
                      variant: 'outlined',
                      overrides: {
                        Root: {
                          style: {
                            maxWidth: '100px',
                            width: 'fit-content'
                          }
                        }
                      }
                    }
                  }
                }}
                onChange={(params) =>
                  updateFilter(params.value, KravListFilter.RELEVANS)
                }
              />
            </Block>

            {/* 
            USIKKERT OM VI SKAL FILTERER BASERT PÅ TEMA


            <Block marginLeft={selectorMarginLeft} marginTop={selectorMarginTop} width="100%" minWidth="200px">
              <CustomizedSelect
                clearable={false}
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
            </Block> */}
            <Block marginLeft={selectorMarginLeft} marginTop={selectorMarginTop} width="100%" minWidth="200px">
              <CustomizedSelect
                clearable={false}
                size="compact"
                placeholder="lover"
                overrides={{
                  DropdownListItem: {
                    style: {
                      wordBreak: 'break-all'
                    },
                  },
                  Tag: {
                    props: {
                      overrides: {
                        Root: {
                          style: {
                            maxWidth: '150px',
                            width: 'fit-content'
                          }
                        }
                      }
                    }
                  }
                }}
                options={
                  lover.map((l) => {
                    return { label: l.shortName, id: l.code }
                  })
                  // BRUKER KUN NÅR VI SKAL FILTRERE PÅ TEMA
                  // loverFilter?.map((t) => {
                  //   return { label: t.shortName, id: t.code }
                  // })

                }
                value={filter.lover}
                onChange={(params) =>
                  updateFilter(params.value, KravListFilter.LOVER)
                }
              />
            </Block>
            <Block marginLeft={selectorMarginLeft} marginTop={selectorMarginTop} width="100%" minWidth="150px">
              <CustomizedSelect
                clearable={false}
                size="compact"
                placeholder="Status"
                options={[{ id: KravStatus.AKTIV, label: 'Aktiv' }, { id: KravStatus.UNDER_ARBEID, label: 'Under Arbeid' }, { id: KravStatus.UTGAATT, label: 'Utgått' }, { id: KravStatus.UTKAST, label: 'Utkast' },]}
                value={filter.status}
                overrides={{
                  DropdownListItem: {
                    style: {
                      wordBreak: 'break-all'
                    },
                  },
                  Tag: {
                    props: {
                      overrides: {
                        Root: {
                          style: {
                            maxWidth: '100px',
                            width: 'fit-content'
                          }
                        }
                      }
                    }
                  }
                }}
                onChange={(params) =>
                  updateFilter(params.value, KravListFilter.STATUS)
                }
              />
            </Block>
          </Block>
          <Block display='flex' justifyContent='flex-end' width='100%'>
            <Button kind='tertiary' onClick={() => setFilter({ status: [], relevans: [], tema: [], lover: [] })}>Nullstill filter</Button>
          </Block>
        </Block>

        <Block display={responsiveDisplay} justifyContent='center' alignContent='center' width="100%">
          <Block display="flex" justifyContent="flex-start" width="100%">
            <H2 marginTop="0px" marginBottom="0px">{sortedKravList.length ? sortedKravList.length : 0} Krav</H2>
          </Block>
          <Block display="flex" justifyContent="flex-end" width="100%" alignItems="center">
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