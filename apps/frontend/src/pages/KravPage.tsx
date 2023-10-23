import {Block} from 'baseui/block'
import {HeadingXLarge} from 'baseui/typography'
import {useParams} from 'react-router-dom'
import {deleteKrav, getKravByKravNummer, KravId as KravIdQueryVariables, KravIdParams, kravMapToFormVal} from '../api/KravApi'
import React, {useEffect, useRef, useState} from 'react'
import {Krav, KravId, KravQL, KravStatus, KravVersjon} from '../constants'
import {ViewKrav} from '../components/krav/ViewKrav'
import {EditKrav} from '../components/krav/EditKrav'
import {user} from '../services/User'
import {FormikProps} from 'formik'
import {DeleteItem} from '../components/DeleteItem'
import {useQuery} from '@apollo/client'
import {Tilbakemeldinger} from '../components/krav/tilbakemelding/Tilbakemelding'
import {CustomizedTabs} from '../components/common/CustomizedTabs'
import {ettlevColors, maxPageWidth, pageWidth, responsivePaddingSmall, responsiveWidthSmall} from '../util/theme'
import {useLocationState, useQueryParam} from '../util/hooks'
import {gql} from '@apollo/client/core'
import ExpiredAlert from '../components/krav/ExpiredAlert'
import CustomizedBreadcrumbs, {breadcrumbPaths} from '../components/common/CustomizedBreadcrumbs'
import {codelist, ListName, TemaCode} from '../services/Codelist'
import {Helmet} from 'react-helmet'
import Etterlevelser from '../components/krav/Etterlevelser'
import {ampli} from '../services/Amplitude'
import {Markdown} from '../components/common/Markdown'
import {InformationSquareIcon, PencilIcon, PlusIcon} from '@navikt/aksel-icons'
import {BodyLong, BodyShort, Button, Heading, Skeleton, Tag} from '@navikt/ds-react'

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

const getQueryVariableFromParams = (params: Readonly<Partial<KravIdParams>>) => {
  if (params.id) {
    return {id: params.id}
  } else if (params.kravNummer && params.kravVersjon) {
    return {
      kravNummer: parseInt(params.kravNummer),
      kravVersjon: parseInt(params.kravVersjon),
    }
  } else {
    return undefined
  }
}

export const KravPage = () => {
  const params = useParams<KravIdParams>()
  const [krav, setKrav] = useState<KravQL | undefined>()
  const [kravId, setKravId] = useState<KravId>()
  const {
    loading: kravLoading,
    data: kravQuery,
    refetch: reloadKrav,
  } = useQuery<{ kravById: KravQL }, KravIdQueryVariables>(query, {
    variables: getQueryVariableFromParams(params),
    skip: (!params.id || params.id === 'ny') && !params.kravNummer,
    fetchPolicy: 'no-cache',
  })

  const {state, navigate, changeState} = useLocationState<LocationState>()
  const tilbakemeldingId = useQueryParam('tilbakemeldingId')
  const [tab, setTab] = useState<Section>(!!tilbakemeldingId ? 'tilbakemeldinger' : state?.tab || 'krav')

  const [alleKravVersjoner, setAlleKravVersjoner] = React.useState<KravVersjon[]>([{kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast'}])
  const [kravTema, setKravTema] = useState<TemaCode>()
  const [newVersionWarning, setNewVersionWarning] = useState<boolean>(false)
  const [newKrav, setNewKrav] = useState<boolean>(false)

  React.useEffect(() => {
    if (krav) {
      getKravByKravNummer(krav.kravNummer).then((resp) => {
        if (resp.content.length) {
          const alleVersjoner = resp.content
            .map((k) => {
              return {kravVersjon: k.kravVersjon, kravNummer: k.kravNummer, kravStatus: k.status}
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
    if (krav && kravTema) {
      ampli.logEvent('sidevisning', {
        side: 'Krav side',
        sidetittel: `${kravNumView({kravNummer: krav?.kravNummer, kravVersjon: krav?.kravVersjon})} ${krav.navn}`,
        section: kravTema?.shortName.toString(),
      })
    }
  }, [krav, kravTema])

  useEffect(() => {
    if (tab !== state?.tab) changeState({tab})
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
    if (krav && krav.status === KravStatus.UTGAATT && alleKravVersjoner.length === 1) {
      return true
    } else {
      return krav ? krav.kravVersjon < parseInt(alleKravVersjoner[0].kravVersjon.toString()) : false
    }
  }

  // todo split loading krav and subelements?
  const etterlevelserLoading = kravLoading

  const [edit, setEdit] = useState(krav && !krav.id)
  const formRef = useRef<FormikProps<any>>()

  const newVersion = () => {
    if (!krav) return
    setKravId({id: krav.id, kravVersjon: krav.kravVersjon})
    setKrav({...krav, id: '', kravVersjon: krav.kravVersjon + 1, nyKravVersjon: true})
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
    <div className={"w-full"} key={'K' + krav?.kravNummer + '/' + krav?.kravVersjon} id="content">
      {kravLoading &&
        <div className="grid gap-2">
          <Skeleton variant="text" width="60%"/>
          <Skeleton variant="rectangle" width="100%" height={30}/>
          <Skeleton variant="rounded" width="100%" height={40}/>
        </div>
      }
      {!kravLoading && (
        <div className={"w-full flex justify-center"}>
          {krav?.id && (
            <Helmet>
              <meta charSet="utf-8"/>
              <title>
                {kravNumView({kravNummer: krav?.kravNummer, kravVersjon: krav?.kravVersjon})} {krav.navn}
              </title>
            </Helmet>
          )}
          <div className={"w-full max-w-7xl"}>
            <div className={"flex flex-col justify-center mb-10"}>
              <div className={"flex justify-center w-full mt-6"}>
                <div className={"w-full flex flex-col"}>
                  {krav?.id && (
                    <CustomizedBreadcrumbs
                      fontColor={ettlevColors.grey25}
                      currentPage={kravNumView({kravNummer: krav?.kravNummer, kravVersjon: krav?.kravVersjon})}
                      paths={getBreadcrumPaths()}
                    />
                  )}
                  <div className="flex gap-2 items-center">
                    {krav && (
                      <div className={"flex w-full justify-end"}>
                        <Tag variant={"neutral"}>
                          <BodyShort>
                            Status: {kravStatus(krav.status)}
                          </BodyShort>
                        </Tag>
                      </div>
                    )}
                    {krav?.id && ((user.isKraveier() && !hasKravExpired()) || user.isAdmin()) && (
                      <div className={"flex flex-1 justify-end"}>
                        {krav.status === KravStatus.AKTIV && (
                          <Button onClick={newVersion} variant="tertiary">
                            <div className="flex flex-nowrap items-center whitespace-nowrap gap-1">
                              <PlusIcon className="text-2xl"/>
                              Ny versjon
                            </div>
                          </Button>
                        )}
                        {(user.isAdmin() || krav.status !== KravStatus.AKTIV) && <DeleteItem fun={() => deleteKrav(krav.id)} redirect={'/kravliste'}/>}
                        <Button variant="tertiary" onClick={() => setEdit(!edit)}>
                          <div className="flex flex-nowrap items-center gap-1">
                            <PencilIcon className="text-2xl"/>
                            Rediger
                          </div>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={"flex justify-center"}>
              <div>
                <Heading size={"xsmall"}>
                  {krav && krav?.kravNummer !== 0 ? kravNumView(krav) : 'Ny'}
                </Heading>
                <Heading size={"large"}>
                  {krav && krav?.navn ? krav.navn : 'Ny'}{' '}
                </Heading>

                {krav?.varselMelding && (
                  <div className={"w-fit flex justify-center items-center"}>
                    <InformationSquareIcon fontSize={"1.5rem"}/>
                    <BodyLong className={"ml-1"}>
                      {krav.varselMelding}
                    </BodyLong>
                  </div>
                )}

                {hasKravExpired() && krav && <ExpiredAlert alleKravVersjoner={alleKravVersjoner} statusName={krav.status}/>}
              </div>
            </div>
          </div>
        </div>
      )}

      {krav && !kravLoading && (
        <Block width="100%">
          <Block backgroundColor={ettlevColors.green100} display="flex" width="100%" justifyContent="center">
            <Block maxWidth={maxPageWidth} width="100%">
              <Block width={responsiveWidthSmall} paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} justifyContent="center" display="flex">
                <Block marginTop="40px" width={pageWidth}>
                  <HeadingXLarge marginTop="0px">Hensikten med kravet</HeadingXLarge>
                  <Markdown p1 sources={Array.isArray(krav.hensikt) ? krav.hensikt : [krav.hensikt]}/>
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
                    content: <ViewKrav krav={krav} alleKravVersjoner={alleKravVersjoner}/>,
                  },
                  {
                    title: 'Eksempler på etterlevelse',
                    key: 'etterlevelser',
                    content: <Etterlevelser loading={etterlevelserLoading} krav={krav}/>,
                  },
                  {
                    title: 'Spørsmål og svar',
                    key: 'tilbakemeldinger',
                    content: <Tilbakemeldinger krav={krav} hasKravExpired={hasKravExpired()}/>,
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
                navigate(`/krav/${k.kravNummer}/${k.kravVersjon}`)
              } else {
                reloadKrav()
              }
            } else if (krav.nyKravVersjon) {
              setKrav({...krav, id: kravId!.id, kravVersjon: kravId!.kravVersjon})
            }
            setEdit(false)
            setNewVersionWarning(false)
            setNewKrav(false)
          }}
        />
      )}
    </div>
  )
}

export const query = gql`
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
      aktivertDato
      dokumentasjon
      implementasjoner
      begrepIder
      begreper {
        id
        navn
        beskrivelse
      }
      virkemidler {
        id
        navn
      }
      virkemiddelIder
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

      kravIdRelasjoner
      kravRelasjoner {
        id
        kravNummer
        kravVersjon
        navn
      }
      etterlevelser {
        id
        etterlevelseDokumentasjon {
          id
          etterlevelseNummer
          title
          teamsData {
            id
            name
            productAreaId
            productAreaName
          }
        }
        changeStamp {
          lastModifiedDate
          lastModifiedBy
        }
        status
        suksesskriterieBegrunnelser {
          suksesskriterieId
          begrunnelse
          suksesskriterieStatus
        }
      }
    }
  }
`
