import {HeadingLarge, HeadingXLarge, HeadingXXLarge, LabelLarge, LabelSmall, LabelXSmall, ParagraphMedium, ParagraphSmall} from 'baseui/typography'
import {Block} from 'baseui/block'
import React, {useEffect, useState} from 'react'
import {useMyTeams} from '../api/TeamApi'
import {theme} from '../util'
import Button, {buttonContentStyle, ExternalButton} from '../components/common/Button'
import {Spinner} from '../components/common/Spinner'
import {Behandling, BehandlingQL, emptyPage, EtterlevelseDokumentasjon, PageResponse, Team} from '../constants'
import {StatefulInput} from 'baseui/input'
import {gql, useQuery} from '@apollo/client'
import {ettlevColors, maxPageWidth} from '../util/theme'
import CustomizedTabs from '../components/common/CustomizedTabs'
import {PanelLink} from '../components/common/PanelLink'
import {arkPennIcon, bamseIcon, checkboxChecked, checkboxUnchecked, checkboxUncheckedHover, clearSearchIcon, outlineInfoIcon, searchIcon} from '../components/Images'
import {env} from '../util/env'
import {InfoBlock2} from '../components/common/InfoBlock'
import moment from 'moment'
import {useDebouncedState} from '../util/hooks'
import {SkeletonPanel} from '../components/common/LoadingSkeleton'
import {user} from '../services/User'
import {useNavigate, useParams} from 'react-router-dom'
import {faExternalLinkAlt, faPlus} from '@fortawesome/free-solid-svg-icons'
import {borderColor, borderRadius, borderStyle, borderWidth} from '../components/common/Style'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Helmet} from 'react-helmet'
import {ampli} from '../services/Amplitude'
import CustomizedModal from "../components/common/CustomizedModal";
import {ModalBody, ModalFooter, ModalHeader} from "baseui/modal";
import {Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik} from "formik";
import {etterlevelseDokumentasjonMapToFormVal, etterlevelseDokumentasjonToDto} from "../api/EtterlevelseDokumentasjonApi";
import {FieldWrapper, InputField} from "../components/common/Inputs";
import {FormControl} from "baseui/form-control";
import {ButtonGroup} from "baseui/button-group";
import {Button as BaseUIButton, KIND} from "baseui/button";
import {Code, codelist, ListName} from "../services/Codelist";
import {ACCESSIBILITY_TYPE, PLACEMENT, StatefulTooltip} from "baseui/tooltip";
import LabelWithTooltip from "../components/common/LabelWithTooltip";
import CustomizedSelect from "../components/common/CustomizedSelect";
import {intl} from "../util/intl/intl";
import {TYPE} from "baseui/select";
import {Error} from "../components/common/ModalSchema";
import {useSearchBehandling} from "../api/BehandlingApi";
import {Tag, VARIANT} from "baseui/tag";

type Section = 'mine' | 'siste' | 'alle'

interface BehandlingCount {
  behandlingCount?: number
}

type CustomTeamObject = BehandlingCount & Team

const tabMarginBottom = '48px'

export const MyEtterlevelseDokumentasjonerPage = () => {

  const [etterlevelseDokumentasjon, setEtterlevelseDokumentasjon] = useState<EtterlevelseDokumentasjon>(etterlevelseDokumentasjonMapToFormVal({}))
  const relevansOptions = codelist.getParsedOptions(ListName.RELEVANS)
  const [selectedFilter, setSelectedFilter] = React.useState<number[]>(relevansOptions.map((r, i) => i))
  const [hover, setHover] = React.useState<number>()
  const [isEtterlevelseDokumentasjonerModalOpen, setIsEtterlevelseDokumntasjonerModalOpen] = useState<boolean>(false)
  const [behandlingSearchResult, setbehandlingSearchResult, loadingBehandlingSearchResult] = useSearchBehandling()
  const [selectedBehandling, setSelectedBehandling] = useState<Behandling>();

  ampli.logEvent('sidevisning', {side: 'Side for Behandlinger', sidetittel: 'Dokumentere etterlevelse'})

  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{Block: {props: {role: 'main'}}}}>
      <Helmet>
        <meta charSet="utf-8"/>
        <title>Dokumentere etterlevelse</title>
      </Helmet>
      <Block width="100%" backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            {/* <RouteLink hideUnderline>
            <Button startEnhancer={<img alt={'Chevron venstre ikon'} src={navChevronRightIcon} style={{ transform: 'rotate(180deg)' }} />} size="compact" kind="tertiary">
              {' '}
              Tilbake
            </Button>
          </RouteLink> */}
            <CustomizedBreadcrumbs currentPage="Dokumentere etterlevelse"/>
            <HeadingXXLarge marginTop="0">Dokumentere etterlevelse</HeadingXXLarge>
            <Button onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(true)}>
              Test
            </Button>
          </Block>
        </Block>
      </Block>
      <CustomizedModal isOpen={isEtterlevelseDokumentasjonerModalOpen} onClose={()=>setIsEtterlevelseDokumntasjonerModalOpen(false)}>
        <ModalHeader>Etterlevelsedokumentasjon</ModalHeader>
        <ModalBody>
          <Formik initialValues={etterlevelseDokumentasjon} onSubmit={(values) => {
            let etterlevelseDokumentasjontemp = etterlevelseDokumentasjonToDto(values)
            console.log(values)
          }}>
            {
              ({values, errors: sub, submitForm, isSubmitting}) => {
                return (
                  <Form>
                    <InputField label={"Title"} name={"title"}/>
                    <LabelWithTooltip label={"Oppgi egenskaper til etterlevelsedokumentasjon. Kun relevante kraver blir synlig for etterlevelsedokumentasjon"}/>
                    <FieldArray name="irrelevansFor">
                      {(p: FieldArrayRenderProps) => {
                        return (
                          <FormControl>
                            <Block height="100%" width="calc(100% - 16px)" paddingLeft={theme.sizing.scale700} paddingTop={theme.sizing.scale750}>
                              <ButtonGroup
                                mode="checkbox"
                                kind={KIND.secondary}
                                selected={selectedFilter}
                                size="mini"
                                onClick={(e, i) => {
                                  if (!selectedFilter.includes(i)) {
                                    setSelectedFilter([...selectedFilter, i])
                                    p.remove(p.form.values.irrelevansFor.findIndex((ir: Code) => ir.code === relevansOptions[i].id))
                                  } else {
                                    setSelectedFilter(selectedFilter.filter((value) => value !== i))
                                    p.push(codelist.getCode(ListName.RELEVANS, relevansOptions[i].id as string))
                                  }
                                }}
                                overrides={{
                                  Root: {
                                    style: {
                                      flexWrap: 'wrap',
                                    },
                                  },
                                }}
                              >
                                {relevansOptions.map((r, i) => {
                                  return (
                                    <BaseUIButton
                                      key={'relevans_' + r.id}
                                      startEnhancer={() => {
                                        if (selectedFilter.includes(i)) {
                                          return <img src={checkboxChecked} alt="checked"/>
                                        } else if (!selectedFilter.includes(i) && hover === i) {
                                          return <img src={checkboxUncheckedHover} alt="checkbox hover"/>
                                        } else {
                                          return <img src={checkboxUnchecked} alt="unchecked"/>
                                        }
                                      }}
                                      overrides={{
                                        BaseButton: {
                                          style: {
                                            ...buttonContentStyle,
                                            backgroundColor: selectedFilter.includes(i) ? ettlevColors.green100 : ettlevColors.white,
                                            ...borderWidth('1px'),
                                            ...borderStyle('solid'),
                                            ...borderColor('#6A6A6A'),
                                            paddingLeft: '8px',
                                            paddingRight: '16px',
                                            paddingTop: '8px',
                                            paddingBottom: '10px',
                                            marginRight: '16px',
                                            marginBottom: '16px',
                                            ...borderRadius('4px'),
                                            ':hover': {
                                              backgroundColor: ettlevColors.white,
                                              boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.25), inset 0px -1px 0px rgba(0, 0, 0, 0.25);',
                                            },
                                            ':focus': {
                                              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
                                              outlineWidth: '3px',
                                              outlineStyle: 'solid',
                                              outlinwColor: ettlevColors.focusOutline,
                                            },
                                            width: '100%',
                                            maxWidth: '260px',
                                            justifyContent: 'flex-start',
                                          },
                                          props: {
                                            onMouseEnter: () => {
                                              setHover(i)
                                            },
                                            onMouseLeave: () => {
                                              setHover(undefined)
                                            },
                                          },
                                        },
                                      }}
                                    >
                                      <Block width="100%" marginRight="5px">
                                        <ParagraphMedium margin="0px" $style={{lineHeight: '22px'}}>
                                          {r.label}
                                        </ParagraphMedium>
                                      </Block>
                                      <StatefulTooltip
                                        content={() => <Block padding="20px">{r.description}</Block>}
                                        placement={PLACEMENT.bottom}
                                        accessibilityType={ACCESSIBILITY_TYPE.tooltip}
                                        returnFocus
                                        showArrow
                                        autoFocus
                                      >
                                        <Block display="flex" justifyContent="flex-end">
                                          <img src={outlineInfoIcon} alt="informasjons ikon"/>
                                        </Block>
                                      </StatefulTooltip>
                                    </BaseUIButton>
                                  )
                                })}
                              </ButtonGroup>
                            </Block>
                          </FormControl>
                        )
                      }}
                    </FieldArray>


                    <FieldWrapper>
                      <Field name="behandlingId">
                        {(fp: FieldProps) => {
                          return (
                            <FormControl label={<LabelWithTooltip label={'Behandling'}/>}>
                              <Block>
                                <CustomizedSelect
                                  overrides={{
                                    SearchIcon: {
                                      component: () => <img src={searchIcon} alt="search icon"/>,
                                      style: {
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                      },
                                    },
                                    SearchIconContainer: {
                                      style: {
                                        width: 'calc(100% - 20px)',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                      },
                                    },
                                    IconsContainer: {
                                      style: {
                                        marginRight: '20px',
                                      },
                                    },
                                    ValueContainer: {
                                      style: {
                                        paddingLeft: '10px',
                                      },
                                    },
                                    ControlContainer: {
                                      style: {
                                        ...borderWidth('2px'),
                                      },
                                    },
                                  }}
                                  labelKey={'navn'}
                                  noResultsMsg={intl.emptyTable}
                                  maxDropdownHeight="350px"
                                  searchable={true}
                                  type={TYPE.search}
                                  options={behandlingSearchResult}
                                  placeholder={'Begreper'}
                                  onInputChange={(event) => setbehandlingSearchResult(event.currentTarget.value)}
                                  onChange={(params) => {
                                    console.log(params)
                                    let behandling = params.value.length ? params.value[0] : undefined
                                    if (behandling) {
                                      fp.form.values['behandlingId'] = behandling.id
                                      setSelectedBehandling(behandling as Behandling)
                                      console.log(behandling.navn)
                                    }
                                  }}
                                  // error={!!fp.form.errors.begreper && !!fp.form.submitCount}
                                  isLoading={loadingBehandlingSearchResult}
                                />
                                {selectedBehandling && (
                                  <Tag
                                    variant={VARIANT.outlined}
                                    onActionClick={() => {
                                      setSelectedBehandling(undefined)
                                      fp.form.setFieldValue("behandlingId", "")
                                    }}
                                    overrides={{
                                      Text: {
                                        style: {
                                          fontSize: theme.sizing.scale650,
                                          lineHeight: theme.sizing.scale750,
                                          fontWeight: 400,
                                        },
                                      },
                                      Root: {
                                        style: {
                                          ...borderWidth('1px'),
                                          ':hover': {
                                            backgroundColor: ettlevColors.green50,
                                            borderColor: '#0B483F',
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    {selectedBehandling.navn}
                                  </Tag>
                                )}

                              </Block>
                            </FormControl>
                          )
                        }}
                      </Field>
                      <Error fieldName="begreper" fullWidth/>
                    </FieldWrapper>


                    <Button>Submit</Button>
                  </Form>
                )
              }
            }
          </Formik>
        </ModalBody>
        <ModalFooter><Button onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(false)}>Avbryt</Button></ModalFooter>
      </CustomizedModal>
      <Block
        display={'flex'}
        justifyContent="center"
        width="100%"
        $style={{
          background: `linear-gradient(top, ${ettlevColors.grey50} 80px, ${ettlevColors.grey25} 0%)`,
        }}
      >
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            <BehandlingTabs/>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}

const BehandlingTabs = () => {
  const params = useParams<{ tab?: Section }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Section>(params.tab || 'mine')
  const [doneLoading, setDoneLoading] = useState(false)
  const [variables, setVariables] = useState<Variables>({})
  const {data, loading: behandlingerLoading} = useQuery<{ behandlinger: PageResponse<BehandlingQL> }, Variables>(query, {
    variables,
  })

  const [teams, teamsLoading] = useMyTeams()

  const behandlinger = data?.behandlinger || emptyPage
  const loading = teamsLoading || behandlingerLoading

  const [sortedTeams, setSortedTeams] = React.useState<CustomTeamObject[]>([])

  const sortTeams = (unSortedTeams: Team[]) => {
    return unSortedTeams
      .map((t) => {
        const teamBehandlinger = behandlinger.content.filter((b) => b.teamsData.find((t2) => t2.id === t.id))

        return {
          ...t,
          behandlingCount: teamBehandlinger.length,
        }
      })
      .sort((a, b) => {
        if (a.behandlingCount === 0) {
          return 1
        } else if (b.behandlingCount === 0) {
          return -1
        } else {
          return a.name > b.name ? 1 : -1
        }
      })
  }

  useEffect(() => {
    if (!doneLoading && tab === 'alle') setDoneLoading(true)
    if (!data || behandlingerLoading || doneLoading) return
    else if (tab === 'mine' && !behandlinger.totalElements) setTab('siste')
    else if (tab === 'siste' && !behandlinger.totalElements) setTab('alle')
    else setDoneLoading(true)
  }, [behandlinger, behandlingerLoading])

  useEffect(() => {
    switch (tab) {
      case 'mine':
        setVariables({mineBehandlinger: true})
        break
      case 'siste':
        setVariables({sistRedigert: 20})
        break
    }
    if (tab !== params.tab) navigate(`/dokumentasjoner/${tab}`, {replace: true})
  }, [tab])

  useEffect(() => {
    // Move away from non-functional pages if user isn't logged in
    if (tab !== 'alle' && user.isLoaded() && !user.isLoggedIn()) setTab('alle')
  }, [user.isLoaded()])

  useEffect(() => {
    setSortedTeams(sortTeams(teams))
  }, [teams])

  return (
    <CustomizedTabs
      fontColor={ettlevColors.green800}
      small
      backgroundColor={ettlevColors.grey25}
      activeKey={tab}
      onChange={(args) => setTab(args.activeKey as Section)}
      tabs={[
        {
          key: 'mine',
          title: 'Mine behandlinger',
          content: <MineBehandlinger teams={sortedTeams} behandlinger={behandlinger.content} loading={loading}/>,
        },
        {
          key: 'siste',
          title: 'Mine sist dokumenterte',
          content: <SisteBehandlinger behandlinger={behandlinger.content} loading={loading}/>,
        },
        {
          key: 'alle',
          title: 'Alle',
          content: <Alle/>,
        },
      ]}
    />
  )
}

const MineBehandlinger = ({behandlinger, teams, loading}: { behandlinger: BehandlingQL[]; teams: CustomTeamObject[]; loading: boolean }) => {
  if (loading)
    return (
      <>
        <BehandlingerPanels behandlinger={[]} loading/>
        <Block height={'60px'}/>
        <BehandlingerPanels behandlinger={[]} loading/>
      </>
    )
  return (
    <Block marginBottom={tabMarginBottom}>
      {!behandlinger.length && <ParagraphSmall>Du er ikke medlem av team med registrerte behandlinger </ParagraphSmall>}

      {teams.map((t) => {
        const teamBehandlinger = behandlinger.filter((b) => b.teamsData.find((t2) => t2.id === t.id))
        return (
          <Block key={t.id} marginBottom={theme.sizing.scale900}>
            <Block display={'flex'} justifyContent={'space-between'}>
              <Block>
                <HeadingXLarge marginBottom={theme.sizing.scale100} color={ettlevColors.green600}>
                  {t.name}
                </HeadingXLarge>
                <ParagraphSmall marginTop={0}>
                  Teamet skal etterleve krav i <span style={{fontWeight: 700}}>{teamBehandlinger.length} behandlinger</span>
                </ParagraphSmall>
              </Block>
              <Block alignSelf={'flex-end'} marginBottom={theme.sizing.scale400}>
                <ExternalButton href={`${env.pollyBaseUrl}process/team/${t.id}`} underlineHover size={'mini'}>
                  Legg til behandling <FontAwesomeIcon icon={faExternalLinkAlt}/>
                </ExternalButton>
              </Block>
            </Block>

            <BehandlingerPanels behandlinger={teamBehandlinger}/>
          </Block>
        )
      })}

      <Block maxWidth={'800px'} marginTop={'200px'}>
        <InfoBlock2
          icon={bamseIcon}
          alt={'Bamseikon'}
          title={'Savner du teamet ditt?'}
          beskrivelse={'Legg til teamet i teamkatalogen, så henter vi behandlinger som skal etterleve krav'}
          backgroundColor={ettlevColors.grey25}
        >
          <Block marginTop={theme.sizing.scale600}>
            <ExternalButton href={`${env.teamKatBaseUrl}`}>
              Teamkatalogen <FontAwesomeIcon icon={faExternalLinkAlt}/>
            </ExternalButton>
          </Block>
        </InfoBlock2>
      </Block>
    </Block>
  )
}

const SisteBehandlinger = ({behandlinger, loading}: { behandlinger: BehandlingQL[]; loading: boolean }) => {
  if (!behandlinger.length && !loading) return <ParagraphSmall>Du har ikke dokumentert etterlevelse på krav</ParagraphSmall>
  const sorted = [...behandlinger].sort((a, b) => moment(b.sistEndretEtterlevelse).valueOf() - moment(a.sistEndretEtterlevelse).valueOf())
  return <BehandlingerPanels behandlinger={sorted} loading={loading}/>
}

const Alle = () => {
  const [hover, setHover] = useState(false)
  const pageSize = 20
  const [pageNumber, setPage] = useState(0)
  const [sok, setSok] = useDebouncedState('', 300)
  const tooShort = !!sok.length && sok.trim().length < 3
  const {
    data,
    loading: gqlLoading,
    fetchMore,
  } = useQuery<{ behandlinger: PageResponse<BehandlingQL> }, Variables>(query, {
    variables: {pageNumber, pageSize, sok},
    skip: tooShort,
  })
  const behandlinger = data?.behandlinger || emptyPage
  const loading = !data && gqlLoading

  const lastMer = () => {
    fetchMore({
      variables: {
        pageNumber: data!.behandlinger.pageNumber + 1,
        pageSize,
      },
      updateQuery: (p, o) => {
        const oldData = p.behandlinger
        const newData = o.fetchMoreResult!.behandlinger
        return {
          behandlinger: {
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
    if (sok && pageNumber != 0) setPage(0)
  }, [sok])

  const getBehandlingerWithOutDuplicates = () => {
    return behandlinger.content.filter((value, index, self) => index === self.findIndex((behandling) => behandling.id === value.id))
  }

  return (
    <Block marginBottom={tabMarginBottom}>
      <LabelLarge marginBottom={theme.sizing.scale200}>Søk i alle behandlinger</LabelLarge>
      <Block
        maxWidth="600px"
        marginBottom={theme.sizing.scale1000}
        display={'flex'}
        flexDirection={'column'}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <StatefulInput
          size="compact"
          placeholder="Søk"
          aria-label={'Søk'}
          onChange={(e) => setSok((e.target as HTMLInputElement).value)}
          clearable
          overrides={{
            Root: {style: {paddingLeft: 0, paddingRight: 0, ...borderWidth('1px')}},
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
                        <img src={clearSearchIcon} alt="tøm"/>
                      </Button>
                    ),
                  },
                },
              },
            },
            // EndEnhancer: {style: {marginLeft: theme.sizing.scale400, paddingLeft: 0, paddingRight: 0, backgroundColor: ettlevColors.black}}
          }}
          startEnhancer={<img src={searchIcon} alt="Søk ikon"/>}
          // endEnhancer={<img aria-hidden alt={'Søk ikon'} src={sokButtonIcon} />}
        />
        {tooShort && (
          <LabelSmall color={ettlevColors.error400} alignSelf={'flex-end'} marginTop={theme.sizing.scale200}>
            Minimum 3 tegn
          </LabelSmall>
        )}
      </Block>

      {!tooShort && (
        <>
          {loading && (
            <Block>
              <Block marginLeft={theme.sizing.scale400} marginTop={theme.sizing.scale400}>
                <Spinner size={theme.sizing.scale1000}/>
              </Block>
            </Block>
          )}

          {!loading && !!sok && (
            <Block>
              <HeadingLarge color={ettlevColors.green600}>
                {behandlinger.totalElements} treff: “{sok}”
              </HeadingLarge>
              {!behandlinger.totalElements && <LabelXSmall>Ingen treff</LabelXSmall>}
            </Block>
          )}

          <BehandlingerPanels behandlinger={getBehandlingerWithOutDuplicates()} loading={loading}/>

          {!loading && behandlinger.totalElements !== 0 && (
            <Block display={'flex'} justifyContent={'space-between'} marginTop={theme.sizing.scale1000}>
              <Block display="flex" alignItems="center">
                <Button onClick={lastMer} icon={faPlus} kind={'secondary'} size="compact" disabled={gqlLoading || behandlinger.numberOfElements >= behandlinger.totalElements}>
                  Vis mer
                </Button>

                {gqlLoading && (
                  <Block marginLeft={theme.sizing.scale400}>
                    <Spinner size={theme.sizing.scale800}/>
                  </Block>
                )}
              </Block>
              <LabelSmall marginRight={theme.sizing.scale400}>
                Viser {behandlinger.numberOfElements}/{behandlinger.totalElements}
              </LabelSmall>
            </Block>
          )}
        </>
      )}
    </Block>
  )
}

const BehandlingerPanels = ({behandlinger, loading}: { behandlinger: BehandlingQL[]; loading?: boolean }) => {
  if (loading) return <SkeletonPanel count={5}/>
  return (
    <Block marginBottom={tabMarginBottom}>
      {behandlinger.map((b) => (
        <Block key={b.id} marginBottom={'8px'}>
          <PanelLink
            useTitleUnderLine
            useDescriptionUnderline
            panelIcon={<img src={arkPennIcon} width="33px" height="33px" aria-hidden alt={'Dokumenter behandling ikon'}/>}
            href={`/behandling/${b.id}`}
            title={
              <>
                <strong>
                  B{b.nummer} {b.overordnetFormaal.shortName}
                </strong>
                :{' '}
              </>
            }
            beskrivelse={b.navn}
            rightBeskrivelse={!!b.sistEndretEtterlevelse ? `Sist endret: ${moment(b.sistEndretEtterlevelse).format('ll')}` : ''}
          />
        </Block>
      ))}
    </Block>
  )
}

type Variables = { pageNumber?: number; pageSize?: number; sistRedigert?: number; mineBehandlinger?: boolean; sok?: string; teams?: string[] }

const query = gql`
  query getMineBehandlinger($pageNumber: NonNegativeInt, $pageSize: NonNegativeInt, $mineBehandlinger: Boolean, $sistRedigert: NonNegativeInt, $sok: String) {
    behandlinger: behandling(filter: { mineBehandlinger: $mineBehandlinger, sistRedigert: $sistRedigert, sok: $sok }, pageNumber: $pageNumber, pageSize: $pageSize) {
      pageNumber
      pageSize
      pages
      numberOfElements
      totalElements
      content {
        id
        navn
        nummer
        sistEndretEtterlevelse
        overordnetFormaal {
          shortName
        }
        teamsData {
          id
          name
        }
      }
    }
  }
`
