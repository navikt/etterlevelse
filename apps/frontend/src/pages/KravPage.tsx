import { Block } from 'baseui/block'
import { H1, H2, HeadingXLarge, Paragraph2, Paragraph4 } from 'baseui/typography'
import { useParams } from 'react-router-dom'
import { deleteKrav, getKravByKravNummer, KravIdParams, kravMapToFormVal } from '../api/KravApi'
import React, { useEffect, useRef, useState } from 'react'
import { EtterlevelseQL, EtterlevelseStatus, ExternalCode, Krav, KravId, KravQL, KravStatus, KravVersjon } from '../constants'
import Button from '../components/common/Button'
import { ViewKrav } from '../components/krav/ViewKrav'
import { EditKrav } from '../components/krav/EditKrav'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { user } from '../services/User'
import { theme } from '../util'
import { FormikProps } from 'formik'
import { DeleteItem } from '../components/DeleteItem'
import { Spinner } from '../components/common/Spinner'
import { borderColor, borderRadius, borderStyle, borderWidth, padding } from '../components/common/Style'
import { useQuery } from '@apollo/client'
import { Tilbakemeldinger } from '../components/krav/tilbakemelding/Tilbakemelding'
import { editIcon, informationIcon, pageIcon, plusIcon, sadFolderIcon } from '../components/Images'
import { Label } from '../components/common/PropertyLabel'
import { CustomizedTabs } from '../components/common/CustomizedTabs'
import { ettlevColors, maxPageWidth, pageWidth, responsivePaddingSmall, responsiveWidthSmall } from '../util/theme'
import { CustomizedAccordion, CustomizedPanel, CustomPanelDivider } from '../components/common/CustomizedAccordion'
import * as _ from 'lodash'
import moment from 'moment'
import { useLocationState, useQueryParam } from '../util/hooks'
import { InfoBlock } from '../components/common/InfoBlock'
import { gql } from '@apollo/client/core'
import { PanelLink } from '../components/common/PanelLink'
import ExpiredAlert from '../components/krav/ExpiredAlert'
import CustomizedBreadcrumbs, { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import { Helmet } from 'react-helmet'
import { Card } from 'baseui/card'

export const kravNumView = (it: { kravVersjon: number; kravNummer: number }) => `K${it.kravNummer}.${it.kravVersjon}`
export const kravName = (krav: Krav) => `${kravNumView(krav)} ${krav.navn}`

export const kravStatus = (status: KravStatus | string) => {
  if (!status) return ''
  switch (status) {
    case KravStatus.UTKAST:
      return 'Utkast'
    case KravStatus.AKTIV:
      return 'Aktiv'
    case KravStatus.UTGAATT:
      return 'Utgått'
    default:
      return status
  }
}

type Section = 'krav' | 'etterlevelser' | 'tilbakemeldinger'
type LocationState = { tab: Section; avdelingOpen?: string }

export const KravPage = () => {
  const params = useParams<KravIdParams>()
  const [krav, setKrav] = useState<KravQL | undefined>()
  const [kravId, setKravId] = useState<KravId>()
  const {
    loading: kravLoading,
    data: kravQuery,
    refetch: reloadKrav,
  } = useQuery<{ kravById: KravQL }, KravIdParams>(query, {
    variables: params,
    skip: (!params.id || params.id === 'ny') && !params.kravNummer,
    fetchPolicy: 'no-cache',
  })

  const { state, history, changeState } = useLocationState<LocationState>()
  const tilbakemeldingId = useQueryParam('tilbakemeldingId')
  const [tab, setTab] = useState<Section>(!!tilbakemeldingId ? 'tilbakemeldinger' : state?.tab || 'krav')

  const [alleKravVersjoner, setAlleKravVersjoner] = React.useState<KravVersjon[]>([{ kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' }])
  const [kravTema, setKravTema] = useState<TemaCode>()
  const [newVersionWarning, setNewVersionWarning] = useState<boolean>(false)
  const [newKrav, setNewKrav] = useState<boolean>(false)

  React.useEffect(() => {
    if (krav) {
      getKravByKravNummer(krav.kravNummer).then((resp) => {
        if (resp.content.length) {
          const alleVersjoner = resp.content
            .map((k) => {
              return { kravVersjon: k.kravVersjon, kravNummer: k.kravNummer, kravStatus: k.status }
            })
            .sort((a, b) => (a.kravVersjon > b.kravVersjon ? -1 : 1))

          const filteredVersjoner = alleVersjoner.filter((k) => k.kravStatus !== KravStatus.UTKAST)

          if (filteredVersjoner.length) {
            setAlleKravVersjoner(filteredVersjoner)
          }
        }
      })
      const lovData = codelist.getCode(ListName.LOV, krav.regelverk[0]?.lov?.code)
      if (lovData?.data) {
        setKravTema(codelist.getCode(ListName.TEMA, lovData.data.tema))
      }
    }
  }, [krav])

  useEffect(() => {
    if (tab !== state?.tab) changeState({ tab })
  }, [tab])

  useEffect(() => {
    if (kravQuery?.kravById) setKrav(kravQuery.kravById)
  }, [kravQuery])

  useEffect(() => {
    if (params.id === 'ny') {
      setKrav(kravMapToFormVal({}) as KravQL)
      setEdit(true)
      setNewKrav(true)
    }
  }, [params.id])

  const hasKravExpired = () => {
    return krav ? krav.kravVersjon < alleKravVersjoner[0].kravVersjon : false
  }

  // todo split loading krav and subelements?
  const etterlevelserLoading = kravLoading

  const [edit, setEdit] = useState(krav && !krav.id)
  const formRef = useRef<FormikProps<any>>()

  const newVersion = () => {
    if (!krav) return
    setKravId({ id: krav.id, kravVersjon: krav.kravVersjon })
    setKrav({ ...krav, id: '', kravVersjon: krav.kravVersjon + 1, nyKravVersjon: true })
    setEdit(true)
    setNewVersionWarning(true)
  }

  const getBreadcrumPaths = () => {
    const breadcrumbPaths: breadcrumbPaths[] = [
      {
        pathName: 'Forstå kravene',
        href: '/tema',
      },
    ]

    if (kravTema?.shortName) {
      breadcrumbPaths.push({
        pathName: kravTema.shortName.toString(),
        href: '/tema/' + kravTema.code,
      })
    }
    return breadcrumbPaths
  }

  useEffect(() => {
    // hent krav på ny ved avbryt ny versjon
    if (!edit && !krav?.id && krav?.nyKravVersjon) reloadKrav()
  }, [edit])

  return (
    <Block key={'K' + krav?.kravNummer + '/' + krav?.kravVersjon} width="100%" id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      {kravLoading && <LoadingSkeleton header="Krav" />}
      {!kravLoading && (
        <Block backgroundColor={ettlevColors.green800} display="flex" width="100%" justifyContent="center" paddingBottom="32px">
          {krav?.id && (
            <Helmet>
              <meta charSet="utf-8" />
              <title>
                {kravNumView({ kravNummer: krav?.kravNummer, kravVersjon: krav?.kravVersjon })} {krav.navn}
              </title>
            </Helmet>
          )}
          <Block maxWidth={maxPageWidth} width="100%">
            <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} display="flex" flexDirection="column" justifyContent="center" marginBottom="40px">
              <Block display="flex" alignItems="center" width="100%" justifyContent="center" marginTop="24px">
                <Block width="100%" display="flex" flexDirection="column">
                  {krav?.id && (
                    <CustomizedBreadcrumbs
                      fontColor={ettlevColors.grey25}
                      currentPage={kravNumView({ kravNummer: krav?.kravNummer, kravVersjon: krav?.kravVersjon })}
                      paths={getBreadcrumPaths()}
                    />
                  )}
                  <Block display="flex" width="100%" justifyContent="flex-end" alignItems="center">
                    {krav && (
                      <Block display="flex" width="100%" justifyContent="flex-end">
                        <Block $style={{ ...borderWidth('1px'), ...borderColor('#A0A0A0'), ...borderStyle('solid'), ...borderRadius('4px') }}>
                          <Paragraph4 $style={{ color: '#CCD9D7', fontSize: '16px', lineHeight: '20px', paddingLeft: '8px', paddingRight: '8px', marginTop: '2px', marginBottom: '2px' }}>Status: {kravStatus(krav.status)}</Paragraph4>
                        </Block>
                      </Block>
                    )}
                    {krav?.id && ((user.isKraveier() && !hasKravExpired()) || user.isAdmin()) && (
                      <Block flex="1" display={['none', 'none', 'none', 'none', 'flex', 'flex']} justifyContent="flex-end">
                        {krav.status === KravStatus.AKTIV && (
                          <Button
                            startEnhancer={<img alt="add" src={plusIcon} />}
                            onClick={newVersion}
                            marginLeft
                            size="compact"
                            kind="tertiary"
                            $style={{ color: '#F8F8F8', whiteSpace: 'nowrap', ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px', whiteSpace: 'nowrap' } }}
                          >
                            Ny versjon
                          </Button>
                        )}
                        <DeleteItem fun={() => deleteKrav(krav.id)} redirect={'/kraver'} />
                        <Button
                          startEnhancer={<img src={editIcon} alt="edit" />}
                          size="compact"
                          $style={{ color: '#F8F8F8', ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' } }}
                          kind={'tertiary'}
                          onClick={() => setEdit(!edit)}
                          marginLeft
                        >
                          Rediger
                        </Button>
                      </Block>
                    )}
                  </Block>
                </Block>
              </Block>
            </Block>

            <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} width={responsiveWidthSmall} display="flex" justifyContent="center">
              <Block maxWidth={pageWidth} width="100%">
                <Block $style={{ color: '#F8F8F8', fontWeight: 700, fontSize: '18px', fontFamily: 'Source Sans Pro' }}>
                  {krav && krav?.kravNummer !== 0 ? kravNumView(krav) : 'Ny'}
                </Block>
                <H1 $style={{ color: '#F8F8F8' }} marginTop="16px">
                  {krav && krav?.navn ? krav.navn : 'Ny'}{' '}
                </H1>

                {krav?.varselMelding && (
                  <Block
                    width="fit-content"
                    display="flex"
                    backgroundColor={'#E5F0F7'}
                    $style={{
                      ...padding('12px', '16px'),
                      ...borderColor('#102723'),
                      ...borderWidth('1px'),
                      ...borderStyle('solid'),
                      ...borderRadius('4px'),
                      marginBottom: '32px',
                    }}
                    alignItems={'center'}
                    justifyContent={'center'}
                  >
                    <img src={informationIcon} alt="" />
                    <Paragraph2 marginLeft={theme.sizing.scale500} marginTop="0px" marginBottom="0px">
                      {krav.varselMelding}
                    </Paragraph2>
                  </Block>
                )}

                {hasKravExpired() && krav && <ExpiredAlert alleKravVersjoner={alleKravVersjoner} statusName={krav.status} />}
              </Block>
            </Block>
          </Block>
        </Block>
      )}

      {krav && !kravLoading && (
        <Block width="100%">
          <Block backgroundColor={ettlevColors.green100} display="flex" width="100%" justifyContent="center">
            <Block maxWidth={maxPageWidth} width="100%">
              <Block width={responsiveWidthSmall} paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} justifyContent="center" display="flex">
                <Block marginTop="40px" width={pageWidth}>
                  <H2 marginTop="0px">Hensikten med kravet</H2>
                  <Label title="" p1 markdown={krav.hensikt} />
                </Block>
              </Block>
            </Block>
          </Block>

          <Block
            display={'flex'}
            justifyContent="center"
            width={responsiveWidthSmall}
            paddingLeft={responsivePaddingSmall}
            paddingRight={responsivePaddingSmall}
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
                onChange={(k) => setTab(k.activeKey as Section)}
                tabs={[
                  {
                    title: 'Hvordan etterleve?',
                    key: 'krav',
                    content: <ViewKrav krav={krav} alleKravVersjoner={alleKravVersjoner} />,
                  },
                  {
                    title: 'Eksempler på etterlevelse',
                    key: 'etterlevelser',
                    content: <Etterlevelser loading={etterlevelserLoading} etterlevelser={krav.etterlevelser} />,
                  },
                  {
                    title: 'Spørsmål og svar',
                    key: 'tilbakemeldinger',
                    content: <Tilbakemeldinger krav={krav} hasKravExpired={hasKravExpired()} />,
                  },
                ]}
              />
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
          newVersion={newVersionWarning}
          newKrav={newKrav}
          alleKravVersjoner={alleKravVersjoner}
          close={(k) => {
            if (k) {
              if (k.id !== krav.id) {
                history.push(`/krav/${k.kravNummer}/${k.kravVersjon}`)
              } else {
                reloadKrav()
              }
            } else if (krav.nyKravVersjon) {
              setKrav({ ...krav, id: kravId!.id, kravVersjon: kravId!.kravVersjon })
            }
            setEdit(false)
            setNewVersionWarning(false)
            setNewKrav(false)
          }}
        />
      )}
    </Block>
  )
}

const Etterlevelser = ({ loading, etterlevelser: allEtterlevelser }: { loading: boolean; etterlevelser?: EtterlevelseQL[] }) => {
  const etterlevelser = (allEtterlevelser || [])
    .filter((e) => e.status === EtterlevelseStatus.FERDIG_DOKUMENTERT)
    .sort((a, b) => a.behandling.navn.localeCompare(b.behandling.navn))

  const avdelinger = _.sortedUniqBy(
    (etterlevelser
      ?.map((e) => e.behandling.avdeling)
      .sort((a, b) => (a?.shortName || '').localeCompare(b?.shortName || ''))
      .filter((avdeling) => !!avdeling) || []) as ExternalCode[],
    (a) => a.code,
  )

  return (
    <Block>
      <HeadingXLarge maxWidth={'500px'}>Her kan du se hvordan andre team har dokumentert etterlevelse</HeadingXLarge>
      {loading && <Spinner size={theme.sizing.scale800} />}
      {!loading && !etterlevelser.length && (
        <InfoBlock icon={sadFolderIcon} alt={'Trist mappe ikon'} text={'Det er ikke dokumentert etterlevelse på dette kravet'} color={ettlevColors.red50} />
      )}

      <CustomizedAccordion accordion={false}>
        {avdelinger.map((a) => {
          const avdelingEtterlevelser = etterlevelser?.filter((e) => e.behandling.avdeling?.code === a.code)
          const antall = avdelingEtterlevelser.length
          return (
            <CustomizedPanel key={a.code} title={a.shortName} HeaderActiveBackgroundColor={ettlevColors.green50}>
              {avdelingEtterlevelser.map((e, i) => (
                <CustomPanelDivider>
                  <PanelLink
                    key={e.id}
                    href={`/etterlevelse/${e.id}`}
                    square
                    hideBorderBottom={i !== antall - 1}
                    useUnderline
                    title={
                      <>
                        <strong>
                          {e.behandling.nummer}-{e.behandling.overordnetFormaal.shortName}
                        </strong>
                        : {e.behandling.navn}
                      </>
                    }
                    rightTitle={!!e.behandling.teamsData.length ? e.behandling.teamsData.map((t) => t.name).join(', ') : 'Ingen team'}
                    rightBeskrivelse={`Utfylt: ${moment(e.changeStamp.lastModifiedDate).format('ll')}`}
                    overrides={{
                      Block: {
                        style: {
                          ...borderStyle('hidden'),
                        },
                      },
                    }}
                  // panelIcon={(hover) => <PageIcon hover={hover} />}
                  />
                </CustomPanelDivider>
              ))}
            </CustomizedPanel>
          )
        })}
      </CustomizedAccordion>
    </Block>
  )
}

const PageIcon = (props: { hover: boolean }) => (
  <Block
    $style={{
      ...borderRadius('100%'),
      backgroundColor: props.hover ? ettlevColors.green100 : ettlevColors.green50,
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
      notat
      varselMelding
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
        behovForBegrunnelse
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
