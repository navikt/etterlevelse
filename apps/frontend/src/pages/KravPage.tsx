import { useQuery } from '@apollo/client'
import { InformationSquareIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Button, Heading, Spacer, Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  TKravId as KravIdQueryVariables,
  TKravIdParams,
  deleteKrav,
  getKravByKravNummer,
} from '../api/KravApi'
import { DeleteItem } from '../components/DeleteItem'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { Markdown } from '../components/common/Markdown'
import { temaUrl } from '../components/common/RouteLinkEtterlevelsesdokumentasjon'
import {
  kravNyVersjonIdUrl,
  kravRedigeringIdUrl,
  kravlisteUrl,
} from '../components/common/RouteLinkKrav'
import StatusTag from '../components/common/StatusTag'
import Etterlevelser from '../components/krav/Etterlevelser'
import ExpiredAlert from '../components/krav/ExpiredAlert'
import { AllInfo, ViewKrav } from '../components/krav/ViewKrav'
import { Tilbakemeldinger } from '../components/krav/tilbakemelding/Tilbakemelding'
import { ContentLayout, MainPanelLayout } from '../components/layout/layout'
import { PageLayout } from '../components/scaffold/Page'
import {
  EKravStatus,
  IBreadCrumbPath,
  IKrav,
  IKravVersjon,
  IPageResponse,
  TKravQL,
} from '../constants'
import { getKravWithEtterlevelseQuery } from '../query/KravQuery'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { CodelistService, EListName, TLovCode, TTemaCode } from '../services/Codelist'
import { user } from '../services/User'
import { useLocationState, useQueryParam } from '../util/hooks/customHooks'
import { temaBreadCrumbPath } from './util/BreadCrumbPath'

export const kravNumView = (it: { kravVersjon: number; kravNummer: number }): string =>
  `K${it.kravNummer}.${it.kravVersjon}`
export const kravName = (krav: IKrav): string => `${kravNumView(krav)} ${krav.navn}`

export const kravStatus = (status: EKravStatus | string) => {
  if (!status) return ''
  switch (status) {
    case EKravStatus.UTKAST:
      return 'Utkast'
    case EKravStatus.AKTIV:
      return 'Aktiv'
    case EKravStatus.UTGAATT:
      return 'Utgått'
    default:
      return status
  }
}

type TSection = 'krav' | 'etterlevelser' | 'tilbakemeldinger'
type TLocationState = { tab: TSection; avdelingOpen?: string }

const getQueryVariableFromParams = (params: Readonly<Partial<TKravIdParams>>) => {
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
  const params: Readonly<Partial<TKravIdParams>> = useParams<TKravIdParams>()
  const [codelistUtils] = CodelistService()
  const [krav, setKrav] = useState<TKravQL | undefined>()
  const { loading: kravLoading, data: kravQuery } = useQuery<
    { kravById: TKravQL },
    KravIdQueryVariables
  >(getKravWithEtterlevelseQuery, {
    variables: getQueryVariableFromParams(params),
    skip: (!params.id || params.id === 'ny') && !params.kravNummer,
    fetchPolicy: 'no-cache',
  })

  const { state, navigate, changeState } = useLocationState<TLocationState>()
  const tilbakemeldingId = useQueryParam('tilbakemeldingId')
  const [tab, setTab] = useState<TSection>(
    tilbakemeldingId !== undefined && tilbakemeldingId !== ''
      ? 'tilbakemeldinger'
      : state?.tab || 'krav'
  )

  const [alleKravVersjoner, setAlleKravVersjoner] = useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])
  const [kravTema, setKravTema] = useState<TTemaCode>()

  const slettKravButtonShouldOnlyBeVisibleOnUtkast: boolean = krav?.status === EKravStatus.UTKAST

  useEffect(() => {
    if (krav) {
      getKravByKravNummer(krav.kravNummer).then((response: IPageResponse<IKrav>) => {
        if (response.content.length) {
          const alleVersjoner: IKravVersjon[] = response.content
            .map((krav: IKrav) => {
              return {
                kravNummer: krav.kravNummer,
                kravVersjon: krav.kravVersjon,
                kravStatus: krav.status,
              }
            })
            .sort((a, b) => (a.kravVersjon > b.kravVersjon ? -1 : 1))

          const filteredVersjoner: IKravVersjon[] = alleVersjoner.filter(
            (krav: IKravVersjon) => krav.kravStatus !== EKravStatus.UTKAST
          )

          if (filteredVersjoner.length) {
            setAlleKravVersjoner(filteredVersjoner)
          }
        }
      })
      const lovData: TLovCode = codelistUtils.getCode(
        EListName.LOV,
        krav.regelverk[0]?.lov?.code
      ) as TLovCode
      if (lovData?.data) {
        setKravTema(
          codelistUtils.getCode(EListName.TEMA, lovData.data.tema) as TTemaCode | undefined
        )
      }
    }
  }, [krav])

  useEffect(() => {
    if (krav && kravTema) {
      ampli.logEvent('sidevisning', {
        side: 'Krav side',
        sidetittel: `${kravNumView({
          kravNummer: krav?.kravNummer,
          kravVersjon: krav?.kravVersjon,
        })} ${krav.navn}`,
        section: kravTema?.shortName.toString(),
        ...userRoleEventProp,
      })
    }
  }, [krav, kravTema])

  useEffect(() => {
    if (tab !== state?.tab) changeState({ tab })
  }, [tab])

  useEffect(() => {
    if (kravQuery?.kravById) setKrav(kravQuery.kravById)
  }, [kravQuery])

  const hasKravExpired = () => {
    if (krav?.status === EKravStatus.UTGAATT && alleKravVersjoner.length === 1) {
      return true
    } else {
      return krav ? krav.kravVersjon < parseInt(alleKravVersjoner[0].kravVersjon.toString()) : false
    }
  }

  // todo split loading krav and subelements?
  const etterlevelserLoading: boolean = kravLoading

  const getBreadcrumPaths = () => {
    const breadcrumbPaths: IBreadCrumbPath[] = [temaBreadCrumbPath]

    if (kravTema?.shortName) {
      breadcrumbPaths.push({
        pathName: kravTema.shortName.toString(),
        href: `${temaUrl}/${kravTema.code}`,
      })
    }
    return breadcrumbPaths
  }

  return (
    <PageLayout
      key={'K' + krav?.kravNummer + '/' + krav?.kravVersjon}
      pageTitle={
        kravNumView({
          kravNummer: krav?.kravNummer ? krav.kravNummer : 0,
          kravVersjon: krav?.kravVersjon ? krav.kravVersjon : 0,
        }) +
        ' ' +
        krav?.navn
      }
      currentPage={kravNumView({
        kravNummer: krav?.kravNummer ? krav.kravNummer : 0,
        kravVersjon: krav?.kravVersjon ? krav.kravVersjon : 0,
      })}
      breadcrumbPaths={getBreadcrumPaths()}
    >
      {kravLoading && <LoadingSkeleton header='Krav' />}
      {!kravLoading && (
        <div className='flex w-full pb-8'>
          <div className='flex flex-col w-full'>
            <div className='w-full'>
              <BodyShort>{krav && krav?.kravNummer !== 0 ? kravNumView(krav) : 'Ny'}</BodyShort>
              <Heading className='mb-3' size='medium' level='1'>
                {krav?.navn ? krav.navn : 'Ny'}{' '}
              </Heading>
              {krav && <StatusTag status={krav.status} />}

              {krav?.varselMelding && (
                <div className='w-fit flex justify-center items-center mt-5'>
                  <InformationSquareIcon fontSize='1.5rem' />
                  <BodyLong className='ml-1'>{krav.varselMelding}</BodyLong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {krav && !kravLoading && (
        <ContentLayout>
          <MainPanelLayout>
            {hasKravExpired() && krav && (
              <ExpiredAlert
                alleKravVersjoner={alleKravVersjoner}
                statusName={krav.status}
                description={
                  krav.status === EKravStatus.UTGAATT &&
                  krav.beskrivelse && (
                    <div className='py-3 mb-5'>
                      <Heading size='small' level='2'>
                        Begrunnelse for at kravet er utgått
                      </Heading>
                      <Markdown source={krav.beskrivelse} />
                    </div>
                  )
                }
              />
            )}
            <div className='bg-blue-50 px-5 py-3 mb-5'>
              <Heading size='small' level='2'>
                Hensikten med kravet
              </Heading>
              <Markdown source={krav.hensikt} />
            </div>

            <div className='w-full'>
              <Tabs defaultValue={tab} onChange={(section) => setTab(section as TSection)}>
                <Tabs.List>
                  <Tabs.Tab value='krav' label='Hvordan etterleve?' />
                  <Tabs.Tab value='etterlevelser' label='Hvordan har andre gjort det?' />
                  <Tabs.Tab value='tilbakemeldinger' label='Spørsmål og svar' />
                </Tabs.List>
                <Tabs.Panel value='krav'>
                  <ViewKrav krav={krav} />
                </Tabs.Panel>
                <Tabs.Panel value='etterlevelser'>
                  <Etterlevelser loading={etterlevelserLoading} krav={krav} />
                </Tabs.Panel>
                <Tabs.Panel value='tilbakemeldinger'>
                  <Tilbakemeldinger krav={krav} hasKravExpired={hasKravExpired()} />
                </Tabs.Panel>
              </Tabs>
            </div>
          </MainPanelLayout>
          <div className='max-w-lg w-full border-l-2 border-gray-200 pl-3'>
            <AllInfo header krav={krav} alleKravVersjoner={alleKravVersjoner} noLastModifiedDate />

            <div className='mt-8'>
              {krav?.id && ((user.isKraveier() && !hasKravExpired()) || user.isAdmin()) && (
                <div>
                  <div className='flex flex-1'>
                    {(!hasKravExpired() || user.isAdmin()) && (
                      <Button
                        type='button'
                        size='small'
                        variant='primary'
                        onClick={() => {
                          navigate(kravRedigeringIdUrl(krav.id))
                        }}
                      >
                        Redigér krav
                      </Button>
                    )}

                    {krav.status === EKravStatus.AKTIV && (
                      <Button
                        type='button'
                        className='ml-4'
                        size='small'
                        onClick={() => {
                          navigate(kravNyVersjonIdUrl(krav.id))
                        }}
                        variant='secondary'
                      >
                        Ny versjon av krav
                      </Button>
                    )}
                    <Spacer />
                  </div>
                  {(slettKravButtonShouldOnlyBeVisibleOnUtkast || user.isAdmin()) && (
                    <div className='mt-2.5 flex'>
                      <DeleteItem
                        buttonLabel='Slett krav'
                        buttonSize='small'
                        fun={() => deleteKrav(krav.id)}
                        redirect={`${kravlisteUrl()}`}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ContentLayout>
      )}
    </PageLayout>
  )
}
