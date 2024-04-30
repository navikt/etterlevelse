import { useQuery } from '@apollo/client'
import { FileTextIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyShort,
  Button,
  Heading,
  Label,
  Link,
  Modal,
  ReadMore,
  Tabs,
  Tag,
} from '@navikt/ds-react'
import { FormikProps } from 'formik'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  createEtterlevelse,
  getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber,
  updateEtterlevelse,
} from '../../api/EtterlevelseApi'
import {
  createEtterlevelseMetadata,
  getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion,
  mapEtterlevelseMetadataToFormValue,
  updateEtterlevelseMetadata,
} from '../../api/EtterlevelseMetadataApi'
import { TKravId, getKravByKravNummer } from '../../api/KravApi'
import {
  EEtterlevelseStatus,
  EKravFilterType,
  EKravStatus,
  IBehandling,
  IEtterlevelse,
  IEtterlevelseMetadata,
  IKrav,
  IKravVersjon,
  ITeam,
  TKravQL,
} from '../../constants'
import { getKravWithEtterlevelseQuery } from '../../query/KravQuery'
import { ampli, userRoleEventProp } from '../../services/Amplitude'
import { user } from '../../services/User'
import { behandlingLink } from '../../util/config'
import { Markdown } from '../common/Markdown'
import { ExternalLink } from '../common/RouteLink'
import { TeamName } from '../common/TeamName'
import { getEtterlevelseStatus } from '../etterlevelseDokumentasjon/common/utils'
import { syncEtterlevelseKriterieBegrunnelseWithKrav } from '../etterlevelseDokumentasjonTema/common/utils'
import EditNotatfelt from '../etterlevelseMetadata/EditNotatfelt'
import Etterlevelser from '../krav/Etterlevelser'
import { AllInfo } from '../krav/ViewKrav'
import { Tilbakemeldinger } from '../krav/tilbakemelding/Tilbakemelding'
import EtterlevelseEditFields from './Edit/EtterlevelseEditFields'
import EtterlevelseViewFields from './EtterlevelseViewFields'

type TEttlevelseKravViewProps = {
  temaName?: string
  etterlevelse: IEtterlevelse
  kravId: TKravId
  formRef?: React.Ref<any>
  etterlevelseDokumentasjonTitle?: string
  etterlevelseDokumentasjonId?: string
  etterlevelseNummer?: number
  behandlinger: IBehandling[] | undefined
  teams: ITeam[] | undefined
  varsleMelding?: string
  navigatePath: string
  tidligereEtterlevelser: IEtterlevelse[] | undefined
  kravFilter: EKravFilterType
  nextKravToDocument: string
}

export const EtterlevelseKravView = ({
  temaName,
  kravId,
  etterlevelse,
  varsleMelding,
  etterlevelseDokumentasjonTitle,
  etterlevelseDokumentasjonId,
  behandlinger,
  teams,
  navigatePath,
  tidligereEtterlevelser,
  kravFilter,
  nextKravToDocument,
}: TEttlevelseKravViewProps) => {
  const { data, loading } = useQuery<{ kravById: TKravQL }, TKravId>(getKravWithEtterlevelseQuery, {
    variables: kravId,
    skip: !kravId.id && !kravId.kravNummer,
    fetchPolicy: 'no-cache',
  })
  const params = useParams<{ tema?: string }>()
  const etterlevelserLoading = loading
  const [krav, setKrav] = useState<TKravQL>()
  const [nyereKrav, setNyereKrav] = React.useState<IKrav>()
  const [disableEdit, setDisableEdit] = React.useState<boolean>(false)
  const [editedEtterlevelse, setEditedEtterlevelse] = React.useState<IEtterlevelse>()
  const etterlevelseFormRef: React.Ref<FormikProps<IEtterlevelse> | undefined> = useRef()
  const [isNotatModalOpen, setIsNotatModalOpen] = useState<boolean>(false)
  const [alleKravVersjoner, setAlleKravVersjoner] = React.useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])
  const [statusText, setStatustext] = useState<string>('')
  const [isNavigationModalOpen, setIsNavigationModalOpen] = useState<boolean>(false)
  const [hasNextKrav, setHasNextKrav] = useState<boolean>(true)
  const location = useLocation()
  const navigate = useNavigate()

  const [etterlevelseMetadata, setEtterlevelseMetadata] = useState<IEtterlevelseMetadata>(
    mapEtterlevelseMetadataToFormValue({
      id: 'ny',
      etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
      kravNummer: kravId.kravNummer,
      kravVersjon: kravId.kravVersjon,
    })
  )

  useEffect(() => {
    ;(async () => {
      etterlevelseDokumentasjonId &&
        kravId.kravNummer &&
        getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion(
          etterlevelseDokumentasjonId,
          kravId.kravNummer,
          kravId.kravVersjon
        ).then((resp) => {
          if (resp.content.length) {
            setEtterlevelseMetadata(resp.content[0])
          } else {
            setEtterlevelseMetadata(
              mapEtterlevelseMetadataToFormValue({
                id: 'ny',
                etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
                kravNummer: kravId.kravNummer,
                kravVersjon: kravId.kravVersjon,
              })
            )
          }
        })
    })()
  }, [])

  const getNextKravUrl = (nextKravPath: string): string => {
    const currentPath = location.pathname.split('/krav')
    return currentPath[0] + '/krav' + nextKravPath
  }

  const submit = async (etterlevelse: IEtterlevelse) => {
    const mutatedEtterlevelse = {
      ...etterlevelse,
      fristForFerdigstillelse:
        etterlevelse.status !== EEtterlevelseStatus.OPPFYLLES_SENERE
          ? ''
          : etterlevelse.fristForFerdigstillelse,
      suksesskriterieBegrunnelser: syncEtterlevelseKriterieBegrunnelseWithKrav(etterlevelse, krav),
    }
    setEditedEtterlevelse(mutatedEtterlevelse)

    //double check if etterlevelse already exist before submitting
    let existingEtterlevelseId = ''
    if (etterlevelseDokumentasjonId && krav) {
      const etterlevelseList = (
        await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(
          etterlevelseDokumentasjonId,
          krav.kravNummer
        )
      ).content.filter((e) => e.kravVersjon === krav.kravVersjon)
      if (etterlevelseList.length) {
        existingEtterlevelseId = etterlevelseList[0].id
        mutatedEtterlevelse.id = etterlevelseList[0].id
      }
    }

    if (etterlevelse.id || existingEtterlevelseId) {
      await updateEtterlevelse(mutatedEtterlevelse).then((res) => {
        if (nextKravToDocument !== '') {
          setStatustext(res.status)
          setHasNextKrav(true)
          setIsNavigationModalOpen(true)
        } else {
          setStatustext(res.status)
          setHasNextKrav(false)
          setIsNavigationModalOpen(true)
        }
      })
    } else {
      await createEtterlevelse(mutatedEtterlevelse).then((res) => {
        if (nextKravToDocument !== '') {
          setStatustext(res.status)
          setHasNextKrav(true)
          setIsNavigationModalOpen(true)
        } else {
          setStatustext(res.status)
          setHasNextKrav(false)
          setIsNavigationModalOpen(true)
        }
      })
    }
  }

  useEffect(() => {
    if (data?.kravById) {
      setKrav(data.kravById)

      getKravByKravNummer(data.kravById.kravNummer).then((resp) => {
        if (resp.content.length) {
          const alleVersjoner = resp.content
            .map((krav) => {
              return {
                kravVersjon: krav.kravVersjon,
                kravNummer: krav.kravNummer,
                kravStatus: krav.status,
              }
            })
            .sort((a, b) => (a.kravVersjon > b.kravVersjon ? -1 : 1))

          const filteredVersjoner = alleVersjoner.filter(
            (krav) => krav.kravStatus !== EKravStatus.UTKAST
          )

          if (filteredVersjoner.length) {
            setAlleKravVersjoner(filteredVersjoner)
          }

          const krav = resp.content.filter((k) => k.kravVersjon === data.kravById.kravVersjon + 1)

          if (krav.length && krav[0].status === EKravStatus.AKTIV) setNyereKrav(krav[0])
        }
      })
    }
  }, [data])

  useEffect(() => {
    if (nyereKrav && !user.isAdmin()) {
      setDisableEdit(true)
    }
  }, [nyereKrav])

  return (
    <div>
      {krav && (
        <div className="flex flex-col gap-8">
          <div>
            <BodyShort size="small">
              {temaName} / K{krav.kravNummer}.{krav.kravVersjon}
            </BodyShort>
            <div>
              <Heading size="medium" level="1">
                {krav.navn}
              </Heading>

              {varsleMelding && (
                <div>
                  <Alert size="small" variant="info" className="w-fit">
                    {varsleMelding}
                  </Alert>
                </div>
              )}

              {kravFilter === EKravFilterType.BORTFILTTERTE_KRAV && (
                <BodyShort>
                  <strong>Kravet er bortfiltrert og derfor ikke relevant.</strong>
                </BodyShort>
              )}

              {kravFilter === EKravFilterType.UTGAATE_KRAV && (
                <BodyShort>
                  <strong>Kravet er utgått.</strong> Dere skal ikke dokumentere ny etterlevelse på
                  dette kravet.
                </BodyShort>
              )}
            </div>
          </div>
          <div className="w-full flex">
            <div className="pr-4 flex flex-1 flex-col gap-4 col-span-8">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    {krav.aktivertDato !== null && krav.kravVersjon > 1 && (
                      <Tag variant="warning">
                        Ny versjon {moment(krav.aktivertDato).format('ll')}
                      </Tag>
                    )}
                    {krav.aktivertDato !== null && krav.kravVersjon === 1 && (
                      <BodyShort>Opprettet {moment(krav.aktivertDato).format('ll')}</BodyShort>
                    )}
                  </div>
                  {kravFilter === EKravFilterType.RELEVANTE_KRAV && (
                    <div className="flex items-center gap-2">
                      <BodyShort size="small">
                        {etterlevelseMetadata &&
                        etterlevelseMetadata.tildeltMed &&
                        etterlevelseMetadata.tildeltMed.length >= 1
                          ? 'Tildelt ' + etterlevelseMetadata.tildeltMed[0]
                          : 'Ikke tildelt'}
                      </BodyShort>
                      <Button
                        variant="tertiary"
                        size="small"
                        onClick={() => {
                          const ident = user.getName()
                          if (
                            etterlevelseMetadata.tildeltMed &&
                            user.getName() === etterlevelseMetadata.tildeltMed[0] &&
                            etterlevelseMetadata.id !== 'ny'
                          ) {
                            updateEtterlevelseMetadata({
                              ...etterlevelseMetadata,
                              tildeltMed: [],
                            }).then((resp) => {
                              setEtterlevelseMetadata(resp)
                            })
                          } else if (etterlevelseMetadata.id !== 'ny') {
                            updateEtterlevelseMetadata({
                              ...etterlevelseMetadata,
                              tildeltMed: [ident],
                            }).then((resp) => {
                              setEtterlevelseMetadata(resp)
                            })
                          } else {
                            createEtterlevelseMetadata({
                              ...etterlevelseMetadata,
                              tildeltMed: [ident],
                            }).then((resp) => {
                              setEtterlevelseMetadata(resp)
                            })
                          }
                        }}
                      >
                        {etterlevelseMetadata.tildeltMed &&
                        user.getName() === etterlevelseMetadata.tildeltMed[0]
                          ? 'Fjern meg selv'
                          : 'Tildel meg selv'}
                      </Button>
                    </div>
                  )}
                </div>

                {krav.versjonEndringer && (
                  <ReadMore header="Se hva som er nytt">
                    <Markdown source={krav.versjonEndringer} />
                  </ReadMore>
                )}
              </div>

              <div className="rounded bg-purple-50 p-8">
                <Heading level="2" size="small">
                  Hensikten med kravet
                </Heading>
                <Markdown sources={Array.isArray(krav.hensikt) ? krav.hensikt : [krav.hensikt]} />
              </div>
              <Tabs defaultValue="dokumentasjon">
                <Tabs.List>
                  <Tabs.Tab value="dokumentasjon" label="Dokumentasjon" />
                  <Tabs.Tab value="etterlevelser" label="Hvordan har andre gjort det?" />
                  <Tabs.Tab value="tilbakemeldinger" label="Spørsmål og svar" />
                </Tabs.List>
                <Tabs.Panel value="dokumentasjon">
                  <div className="mt-2">
                    {kravFilter !== EKravFilterType.BORTFILTTERTE_KRAV && (
                      <EtterlevelseEditFields
                        kravFilter={kravFilter}
                        krav={krav}
                        etterlevelse={etterlevelse}
                        submit={submit}
                        formRef={etterlevelseFormRef}
                        varsleMelding={varsleMelding}
                        disableEdit={disableEdit}
                        close={() => {
                          setTimeout(
                            () => navigate(`/dokumentasjon/${etterlevelseDokumentasjonId}`),
                            1
                          )
                        }}
                        navigatePath={navigatePath}
                        editedEtterlevelse={editedEtterlevelse}
                        tidligereEtterlevelser={tidligereEtterlevelser}
                      />
                    )}
                    {kravFilter === EKravFilterType.BORTFILTTERTE_KRAV && (
                      <EtterlevelseViewFields
                        etterlevelse={etterlevelse}
                        suksesskriterier={krav.suksesskriterier}
                        tidligereEtterlevelser={tidligereEtterlevelser}
                      />
                    )}
                  </div>
                </Tabs.Panel>
                <Tabs.Panel value="etterlevelser">
                  <div className="mt-2">
                    <Etterlevelser loading={etterlevelserLoading} krav={krav} modalVersion />
                  </div>
                </Tabs.Panel>
                <Tabs.Panel value="tilbakemeldinger">
                  <div className="mt-2">
                    <Tilbakemeldinger krav={krav} hasKravExpired={false} />
                  </div>
                </Tabs.Panel>
              </Tabs>
            </div>
            <div className="pl-4 border-l border-border-divider w-full max-w-sm">
              <Tabs defaultValue="mer" size="small">
                <Tabs.List>
                  <Tabs.Tab className="whitespace-nowrap" value="mer" label="Mer om kravet" />
                  <Tabs.Tab
                    className="whitespace-nowrap"
                    value="dokument"
                    label="Om etterlevelsen"
                  />
                  <Tabs.Tab value="notat" label="Notat" />
                </Tabs.List>
                <Tabs.Panel value="mer">
                  <div className="mt-2 p-4">
                    <AllInfo krav={krav} alleKravVersjoner={alleKravVersjoner} />
                  </div>
                </Tabs.Panel>
                <Tabs.Panel value="dokument">
                  <div className="mt-2 p-4">
                    <div className="mb-4">
                      <Label size="medium">Tittel</Label>
                      <BodyShort>{etterlevelseDokumentasjonTitle}</BodyShort>
                    </div>
                    <div className="mb-4">
                      <Label size="medium">Behandling</Label>
                      {behandlinger?.map((behandling) => (
                        <ExternalLink key={behandling.id} href={behandlingLink(behandling.id)}>
                          {behandling.navn}
                        </ExternalLink>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <Label size="medium">Team</Label>
                      {teams?.map((team, index) => (
                        <TeamName key={'team_' + index} id={team.id} big link />
                      ))}
                    </div>
                  </div>
                </Tabs.Panel>
                <Tabs.Panel value="notat">
                  <div className="mt-2 p-4">
                    <div className="flex justify-between mb-2.5">
                      <Label className="flex gap-1" size="medium">
                        <FileTextIcon fontSize="1.5rem" area-label="" aria-hidden />
                        Notat
                      </Label>
                      <Button
                        variant="secondary"
                        size="xsmall"
                        onClick={() => setIsNotatModalOpen(true)}
                      >
                        Rediger
                      </Button>
                    </div>

                    <EditNotatfelt
                      isOpen={isNotatModalOpen}
                      setIsNotatfeltOpen={setIsNotatModalOpen}
                      etterlevelseMetadata={etterlevelseMetadata}
                      setEtterlevelseMetadata={setEtterlevelseMetadata}
                    />

                    <div className="break-words">
                      <Markdown source={etterlevelseMetadata.notater} />
                    </div>
                  </div>
                </Tabs.Panel>
              </Tabs>
            </div>
          </div>

          <Modal
            open={isNavigationModalOpen}
            onClose={() => setIsNavigationModalOpen(false)}
            header={{ heading: 'Endringene er lagret' }}
          >
            <Modal.Body>
              <BodyShort>
                Status er satt til: {getEtterlevelseStatus(statusText as EEtterlevelseStatus)}
              </BodyShort>
            </Modal.Body>
            <Modal.Footer>
              <div className="w-full flex flex-col gap-2">
                <BodyShort>Hvor ønsker du å gå?</BodyShort>
                {hasNextKrav && (
                  <Link
                    href={getNextKravUrl(nextKravToDocument)}
                    onClick={() => {
                      ampli.logEvent('knapp klikket', {
                        tekst: 'Til nest krav som ikke er ferdig utfylt i dette temaet',
                        pagePath: location.pathname,
                        ...userRoleEventProp,
                      })
                    }}
                  >
                    <Button variant="secondary">
                      Til neste krav som ikke er ferdig utfylt i dette temaet
                    </Button>
                  </Link>
                )}
                <Button onClick={() => setIsNavigationModalOpen(false)} variant="secondary">
                  Fortsett å redigere dokumentet
                </Button>

                <Link
                  href={'/dokumentasjon/' + etterlevelseDokumentasjonId + '/' + params.tema}
                  className="flex w-full"
                  onClick={() => {
                    ampli.logEvent('knapp klikket', {
                      tekst: 'Til temaoversikten',
                      pagePath: location.pathname,
                      ...userRoleEventProp,
                    })
                  }}
                >
                  <Button className="flex w-full" variant="secondary">
                    Til temaoversikten
                  </Button>
                </Link>
              </div>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </div>
  )
}
