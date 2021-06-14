import {Block} from 'baseui/block'
import {H1, HeadingXLarge} from 'baseui/typography'
import {useParams} from 'react-router-dom'
import {deleteKrav, KravIdParams, mapToFormVal} from '../api/KravApi'
import React, {useEffect, useRef, useState} from 'react'
import {
  EtterlevelseQL,
  EtterlevelseStatus,
  ExternalCode,
  Krav,
  KravId,
  KravQL,
  KravStatus,
} from '../constants'
import Button from '../components/common/Button'
import {ViewKrav} from '../components/krav/ViewKrav'
import {EditKrav} from '../components/krav/EditKrav'
import RouteLink from '../components/common/RouteLink'
import {LoadingSkeleton} from '../components/common/LoadingSkeleton'
import {user} from '../services/User'
import {theme} from '../util'
import {FormikProps} from 'formik'
import {DeleteItem} from '../components/DeleteItem'
import {Spinner} from '../components/common/Spinner'
import {borderRadius} from '../components/common/Style'
import {useQuery} from '@apollo/client'
import {Tilbakemeldinger} from '../components/krav/Tilbakemelding'
import {
  chevronLeft,
  editIcon,
  pageIcon,
  plusIcon,
  sadFolderIcon,
} from '../components/Images'
import {Label} from '../components/common/PropertyLabel'
import {
  CustomizedTab,
  CustomizedTabs,
} from '../components/common/CustomizedTabs'
import {ettlevColors, maxPageWidth, pageWidth} from '../util/theme'
import {
  CustomizedAccordion,
  CustomizedPanel,
} from '../components/common/CustomizedAccordion'
import * as _ from 'lodash'
import moment from 'moment'
import {useLocationState, useQueryParam} from '../util/hooks'
import {InfoBlock} from '../components/common/InfoBlock'
import {gql} from '@apollo/client/core'
import {PanelLink} from '../components/common/PanelLink'

export const kravNumView = (it: {kravVersjon: number; kravNummer: number}) =>
  `K${it.kravNummer}.${it.kravVersjon}`
export const kravName = (krav: Krav) => `${kravNumView(krav)} - ${krav.navn}`

export const kravStatus = (status: KravStatus) => {
  if (!status) return ''
  switch (status) {
    case KravStatus.UTKAST:
      return 'Utkast'
    case KravStatus.UNDER_ARBEID:
      return 'Under arbeid'
    case KravStatus.AKTIV:
      return 'Aktiv'
    case KravStatus.UTGAATT:
      return 'Utgått'
    default:
      return status
  }
}

type Section = 'krav' | 'etterlevelser' | 'tilbakemeldinger'
type LocationState = {tab: Section; avdelingOpen?: string}

export const KravPage = () => {
  const params = useParams<KravIdParams>()
  const [krav, setKrav] = useState<KravQL | undefined>()
  const [kravId, setKravId] = useState<KravId>()
  const {
    loading: kravLoading,
    data: kravQuery,
    refetch: reloadKrav,
  } = useQuery<{kravById: KravQL}, KravIdParams>(query, {
    variables: params,
    skip: (!params.id || params.id === 'ny') && !params.kravNummer,
  })

  const {state, history, changeState} = useLocationState<LocationState>()
  const tilbakemeldingId = useQueryParam('tilbakemeldingId')
  const [tab, setTab] = useState<Section>(
    !!tilbakemeldingId ? 'tilbakemeldinger' : state?.tab || 'krav',
  )

  useEffect(() => {
    if (tab !== state?.tab) changeState({tab})
  }, [tab])

  useEffect(() => {
    if (kravQuery?.kravById) setKrav(kravQuery.kravById)
  }, [kravQuery])

  useEffect(() => {
    if (params.id === 'ny') {
      setKrav(mapToFormVal({}) as KravQL)
      setEdit(true)
    }
  }, [params.id])

  // todo split loading krav and subelements?
  const etterlevelserLoading = kravLoading

  const [edit, setEdit] = useState(krav && !krav.id)
  const formRef = useRef<FormikProps<any>>()

  const newVersion = () => {
    if (!krav) return
    setKravId({id: krav.id, kravVersjon: krav.kravVersjon})
    setKrav({
      ...krav,
      id: '',
      kravVersjon: krav.kravVersjon + 1,
      nyKravVersjon: true,
    })
    setEdit(true)
  }

  useEffect(() => {
    // hent krav på ny ved avbryt ny versjon
    if (!edit && !krav?.id && krav?.nyKravVersjon) reloadKrav()
  }, [edit])

  return (
    <Block width="100%" overrides={{Block: {props: {role: 'main'}}}}>
      {kravLoading && <LoadingSkeleton header="Krav" />}
      {!kravLoading && (
        <Block
          backgroundColor={ettlevColors.green800}
          display="flex"
          width="100%"
          justifyContent="center"
          paddingBottom="32px"
        >
          <Block maxWidth={maxPageWidth} width="100%">
            <Block
              paddingLeft="40px"
              paddingRight="40px"
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <Block
                display="flex"
                width="100%"
                justifyContent="center"
                marginTop="24px"
              >
                <Block display="flex" alignItems="center" width="100%">
                  <Block flex="1" display="flex" justifyContent="flex-start">
                    <RouteLink href={'/krav'} hideUnderline>
                      <Button
                        startEnhancer={
                          <img alt={'Chevron left'} src={chevronLeft} />
                        }
                        size="compact"
                        kind="underline-hover"
                        $style={{color: '#F8F8F8'}}
                      >
                        {' '}
                        Tilbake
                      </Button>
                    </RouteLink>
                  </Block>
                  <Block
                    flex="1"
                    display={['none', 'none', 'none', 'none', 'flex', 'flex']}
                    justifyContent="flex-end"
                  >
                    {krav?.id && user.isKraveier() && (
                      <Button
                        startEnhancer={<img alt="add" src={plusIcon} />}
                        onClick={newVersion}
                        marginLeft
                        size="compact"
                        kind="tertiary"
                        $style={{
                          color: '#F8F8F8',
                          ':hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline 3px',
                          },
                        }}
                      >
                        Ny versjon
                      </Button>
                    )}
                    {krav?.id && user.isKraveier() && (
                      <DeleteItem
                        fun={() => deleteKrav(krav.id)}
                        redirect={'/krav'}
                      />
                    )}
                    {krav?.id && user.isKraveier() && (
                      <Button
                        startEnhancer={<img src={editIcon} alt="edit" />}
                        size="compact"
                        $style={{
                          color: '#F8F8F8',
                          ':hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline 3px',
                          },
                        }}
                        kind={'tertiary'}
                        onClick={() => setEdit(!edit)}
                        marginLeft
                      >
                        Rediger
                      </Button>
                    )}
                  </Block>
                </Block>
              </Block>
            </Block>

            <Block
              paddingLeft="40px"
              marginTop="31px"
              paddingRight="40px"
              width="calc(100% - 80px)"
              display="flex"
              justifyContent="center"
            >
              <Block maxWidth={pageWidth} width="100%" marginTop="7px">
                <Block
                  $style={{
                    color: '#F8F8F8',
                    fontWeight: 700,
                    fontSize: '18px',
                    fontFamily: 'Source Sans Pro',
                  }}
                >
                  {krav && krav?.kravNummer !== 0 ? kravNumView(krav) : 'Ny'}
                </Block>
                <H1 $style={{color: '#F8F8F8'}}>
                  {krav && krav?.navn ? krav.navn : 'Ny'}{' '}
                </H1>
              </Block>
            </Block>
          </Block>
        </Block>
      )}

      {krav && !kravLoading && (
        <Block width="100%">
          <Block
            backgroundColor={ettlevColors.green100}
            display="flex"
            width="100%"
            justifyContent="center"
          >
            <Block maxWidth={maxPageWidth} width="100%">
              <Block
                paddingLeft="40px"
                paddingRight="40px"
                justifyContent="center"
                display="flex"
              >
                <Block marginBottom="80px" marginTop="64px" width={pageWidth}>
                  <Label title="" p1 markdown={krav.hensikt} />
                </Block>
              </Block>
            </Block>
          </Block>

          <Block
            display={'flex'}
            justifyContent="center"
            width="100%"
            $style={{
              background: `linear-gradient(top, ${ettlevColors.green100} 50px, ${ettlevColors.grey25} 0%)`,
            }}
          >
            <Block maxWidth={pageWidth} width="100%">
              <CustomizedTabs
                fontColor={ettlevColors.green600}
                activeColor={ettlevColors.green800}
                tabBackground={ettlevColors.green100}
                activeKey={tab}
                onChange={k => setTab(k.activeKey as Section)}
              >
                <CustomizedTab title={'Om kravet'} key={'krav'}>
                  <ViewKrav krav={krav} />
                </CustomizedTab>
                <CustomizedTab
                  title={'Eksempler på etterlevelse'}
                  key={'etterlevelser'}
                >
                  <Etterlevelser
                    loading={etterlevelserLoading}
                    etterlevelser={krav.etterlevelser}
                  />
                </CustomizedTab>
                <CustomizedTab
                  title={'Tilbakemeldinger'}
                  key={'tilbakemeldinger'}
                >
                  <Tilbakemeldinger krav={krav} />
                </CustomizedTab>
              </CustomizedTabs>
            </Block>
          </Block>
        </Block>
      )}

      {krav && (
        <EditKrav
          isOpen={edit}
          setIsOpen={setEdit}
          krav={krav}
          formRef={formRef}
          close={k => {
            if (k) {
              if (k.id !== krav.id) {
                history.push(`/krav/${k.kravNummer}/${k.kravVersjon}`)
              } else {
                reloadKrav()
              }
            } else if (krav.nyKravVersjon) {
              setKrav({
                ...krav,
                id: kravId!.id,
                kravVersjon: kravId!.kravVersjon,
              })
            }
            setEdit(false)
          }}
        />
      )}
    </Block>
  )
}

const Etterlevelser = ({
  loading,
  etterlevelser: allEtterlevelser,
}: {
  loading: boolean
  etterlevelser?: EtterlevelseQL[]
}) => {
  const etterlevelser = (allEtterlevelser || [])
    .filter(e => e.status === EtterlevelseStatus.FERDIG)
    .sort((a, b) => a.behandling.navn.localeCompare(b.behandling.navn))

  const avdelinger = _.sortedUniqBy(
    (etterlevelser
      ?.map(e => e.behandling.avdeling)
      .sort((a, b) => (a?.shortName || '').localeCompare(b?.shortName || ''))
      .filter(avdeling => !!avdeling) || []) as ExternalCode[],
    a => a.code,
  )
  const {state, changeState} = useLocationState<LocationState>()

  return (
    <Block>
      <HeadingXLarge maxWidth={'500px'}>
        Her kan du se hvordan andre team har dokumentert etterlevelse
      </HeadingXLarge>
      {loading && <Spinner size={theme.sizing.scale800} />}
      {!loading && !etterlevelser.length && (
        <InfoBlock
          icon={sadFolderIcon}
          alt={'Trist mappe ikon'}
          text={'Det er ikke dokumentert etterlevelse på dette kravet'}
          color={ettlevColors.red50}
        />
      )}

      <CustomizedAccordion
        initialState={{
          expanded: state?.avdelingOpen ? [state?.avdelingOpen] : [],
        }}
        onChange={k =>
          changeState({
            avdelingOpen: k.expanded.length
              ? (k.expanded[0] as string)
              : undefined,
          })
        }
      >
        {avdelinger.map(a => (
          <CustomizedPanel key={a.code} title={a.shortName}>
            {etterlevelser
              ?.filter(e => e.behandling.avdeling?.code === a.code)
              .map(e => (
                <PanelLink
                  key={e.id}
                  href={`/etterlevelse/${e.id}`}
                  title={e.behandling.navn}
                  beskrivelse={e.behandling.overordnetFormaal.shortName}
                  rightTitle={
                    !!e.behandling.teamsData.length
                      ? e.behandling.teamsData.map(t => t.name).join(', ')
                      : 'Ingen team'
                  }
                  rightBeskrivelse={`Utfylt: ${moment(
                    e.changeStamp.lastModifiedDate,
                  ).format('ll')}`}
                  panelIcon={hover => <PageIcon hover={hover} />}
                />
              ))}
          </CustomizedPanel>
        ))}
      </CustomizedAccordion>
    </Block>
  )
}

const PageIcon = (props: {hover: boolean}) => (
  <Block
    $style={{
      ...borderRadius('100%'),
      backgroundColor: props.hover
        ? ettlevColors.green100
        : ettlevColors.green50,
      minWidth: '38px',
      maxWidth: '38px',
      height: '38px',
      display: 'flex',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <img src={pageIcon} alt={'Page icon'} width={'22px'} height={'30px'} />
  </Block>
)

const query = gql`
  query getKravWithEtterlevelse($id: ID, $kravNummer: Int, $kravVersjon: Int) {
    kravById(id: $id, nummer: $kravNummer, versjon: $kravVersjon) {
      id
      kravNummer
      kravVersjon
      changeStamp {
        lastModifiedBy
        lastModifiedDate
      }

      navn
      beskrivelse
      hensikt
      utdypendeBeskrivelse
      versjonEndringer

      dokumentasjon
      implementasjoner
      begrepIder
      begreper {
        id
        navn
        beskrivelse
      }
      varslingsadresser {
        adresse
        type
        slackChannel {
          id
          name
          numMembers
        }
        slackUser {
          id
          name
        }
      }
      rettskilder
      regelverk {
        lov {
          code
          shortName
        }
        spesifisering
      }
      tagger
      periode {
        start
        slutt
      }

      avdeling {
        code
        shortName
      }
      underavdeling {
        code
        shortName
      }
      relevansFor {
        code
        shortName
      }
      status

      suksesskriterier {
        id
        navn
        beskrivelse
      }

      etterlevelser {
        id
        behandling {
          id
          nummer
          navn
          overordnetFormaal {
            shortName
          }
          systemer {
            code
            shortName
          }
          avdeling {
            code
            shortName
          }
          teamsData {
            id
            name
          }
        }
        changeStamp {
          lastModifiedDate
        }
        status
      }
    }
  }
`
