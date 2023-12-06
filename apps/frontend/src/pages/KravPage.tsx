import { useParams } from 'react-router-dom'
import { deleteKrav, getKravByKravNummer, KravId as KravIdQueryVariables, KravIdParams, kravMapToFormVal } from '../api/KravApi'
import React, { useEffect, useRef, useState } from 'react'
import { Krav, KravId, KravQL, KravStatus, KravVersjon } from '../constants'
import { AllInfo, ViewKrav } from '../components/krav/ViewKrav'
import { EditKrav } from '../components/krav/EditKrav'
import { user } from '../services/User'
import { FormikProps } from 'formik'
import { DeleteItem } from '../components/DeleteItem'
import { useQuery } from '@apollo/client'
import { Tilbakemeldinger } from '../components/krav/tilbakemelding/Tilbakemelding'
import { useLocationState, useQueryParam } from '../util/hooks'
import { gql } from '@apollo/client/core'
import ExpiredAlert from '../components/krav/ExpiredAlert'
import CustomizedBreadcrumbs, { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import { Helmet } from 'react-helmet'
import Etterlevelser from '../components/krav/Etterlevelser'
import { ampli } from '../services/Amplitude'
import { Markdown } from '../components/common/Markdown'
import { InformationSquareIcon, PencilIcon, PlusIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Box, Button, Detail, Heading, Spacer, Tabs, Tag } from '@navikt/ds-react'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import StatusTag from '../components/common/StatusTag'

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
    return { id: params.id }
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

  const { state, navigate, changeState } = useLocationState<LocationState>()
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
    if (krav && kravTema) {
      ampli.logEvent('sidevisning', {
        side: 'Krav side',
        sidetittel: `${kravNumView({ kravNummer: krav?.kravNummer, kravVersjon: krav?.kravVersjon })} ${krav.navn}`,
        section: kravTema?.shortName.toString(),
        role: user.isAdmin() ? 'ADMIN' : user.isKraveier() ? 'KRAVEIER' : 'ETTERLEVER',
      })
    }
  }, [krav, kravTema])

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
    <div className="w-full" key={'K' + krav?.kravNummer + '/' + krav?.kravVersjon} id="content" role="main">
      {kravLoading && <LoadingSkeleton header="Krav" />}
      {!kravLoading && (
        <div className="flex w-full pb-8">
          {krav?.id && (
            <Helmet>
              <meta charSet="utf-8" />
              <title>
                {kravNumView({ kravNummer: krav?.kravNummer, kravVersjon: krav?.kravVersjon })} {krav.navn}
              </title>
            </Helmet>
          )}
          <div className="flex flex-col w-full">
            {krav?.id && <CustomizedBreadcrumbs currentPage={kravNumView({ kravNummer: krav?.kravNummer, kravVersjon: krav?.kravVersjon })} paths={getBreadcrumPaths()} />}
            <div className="w-full">
              <BodyShort>{krav && krav?.kravNummer !== 0 ? kravNumView(krav) : 'Ny'}</BodyShort>
              <Heading className="mb-3" size="medium" level="1">
                {krav && krav?.navn ? krav.navn : 'Ny'}{' '}
              </Heading>
              {krav && <StatusTag status={krav.status} />}

              {krav?.varselMelding && (
                <div className="w-fit flex justify-center items-center">
                  <InformationSquareIcon fontSize="1.5rem" />
                  <BodyLong className="ml-1">{krav.varselMelding}</BodyLong>
                </div>
              )}

              {hasKravExpired() && krav && <ExpiredAlert alleKravVersjoner={alleKravVersjoner} statusName={krav.status} />}
            </div>
          </div>
        </div>
      )}

      {krav && !kravLoading && (
        <div className="flex w-full">
          <div className="pr-14 w-full">
            <div className="bg-blue-50 px-5 py-3 mb-5">
              <Heading size="small" level="2">
                Hensikten med kravet
              </Heading>
              <Markdown sources={Array.isArray(krav.hensikt) ? krav.hensikt : [krav.hensikt]} />
            </div>

            <div className="w-full">
              <Tabs defaultValue={tab} onChange={(s) => setTab(s as Section)}>
                <Tabs.List>
                  <Tabs.Tab value="krav" label="Hvordan etterleve?" />
                  <Tabs.Tab value="etterlevelser" label="Eksempler på etterlevelse" />
                  <Tabs.Tab value="tilbakemeldinger" label="Spørsmål og svar" />
                </Tabs.List>
                <Tabs.Panel value="krav">
                  <ViewKrav krav={krav} />
                </Tabs.Panel>
                <Tabs.Panel value="etterlevelser">
                  <Etterlevelser loading={etterlevelserLoading} krav={krav} />
                </Tabs.Panel>
                <Tabs.Panel value="tilbakemeldinger">
                  <Tilbakemeldinger krav={krav} hasKravExpired={hasKravExpired()} />
                </Tabs.Panel>
              </Tabs>
            </div>
          </div>
          <div className="max-w-sm w-full border-l-2 border-gray-200 pl-3">
            <AllInfo header krav={krav} alleKravVersjoner={alleKravVersjoner} noLastModifiedDate />

            <div className="mt-8">
              {krav?.id && ((user.isKraveier() && !hasKravExpired()) || user.isAdmin()) && (
                <div>
                  <div className="flex flex-1">
                    <Button type="button" size="small" variant="primary" onClick={() => setEdit(!edit)}>
                      Rediger krav
                    </Button>

                    {krav.status === KravStatus.AKTIV && (
                      <Button type="button" className="ml-4" size="small" onClick={newVersion} variant="secondary">
                        Ny versjon av krav
                      </Button>
                    )}
                    <Spacer />
                  </div>
                  {(user.isAdmin() || krav.status !== KravStatus.AKTIV) && (
                    <div className="mt-2.5 flex">
                      <DeleteItem buttonLabel="Slett krav" buttonSize="small" fun={() => deleteKrav(krav.id)} redirect={'/kravliste'} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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
              setKrav({ ...krav, id: kravId!.id, kravVersjon: kravId!.kravVersjon })
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
