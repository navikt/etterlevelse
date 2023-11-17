import { Behandling, Etterlevelse, EtterlevelseMetadata, EtterlevelseStatus, Krav, KRAV_FILTER_TYPE, KravQL, KravStatus, Team } from '../../constants'
import { FormikProps } from 'formik'
import { createEtterlevelse, getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber, updateEtterlevelse } from '../../api/EtterlevelseApi'
import React, { useEffect, useRef, useState } from 'react'
import { getKravByKravNumberAndVersion, KravId } from '../../api/KravApi'
import { query } from '../../pages/KravPage'
import { user } from '../../services/User'
import { useQuery } from '@apollo/client'
import { Tilbakemeldinger } from '../krav/tilbakemelding/Tilbakemelding'
import Etterlevelser from '../krav/Etterlevelser'
import { Markdown } from '../common/Markdown'
import {
  createEtterlevelseMetadata,
  getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion,
  mapEtterlevelseMetadataToFormValue,
  updateEtterlevelseMetadata,
} from '../../api/EtterlevelseMetadataApi'
import { getPageWidth } from '../../util/pageWidth'
import { useNavigate, useParams } from 'react-router-dom'
import { Section } from '../../pages/EtterlevelseDokumentasjonPage'
import { syncEtterlevelseKriterieBegrunnelseWithKrav } from '../etterlevelseDokumentasjonTema/common/utils'
import EtterlevelseEditFields from './Edit/EtterlevelseEditFields'
import moment from 'moment'
import { Alert, BodyLong, BodyShort, Button, Detail, Heading, Label, ReadMore, Tabs, Tag } from '@navikt/ds-react'
import { behandlingLink } from '../../util/config'
import { ExternalLink } from '../common/RouteLink'
import { TeamName } from '../common/TeamName'
import { AllInfo } from '../krav/ViewKrav'
import { FileTextIcon } from '@navikt/aksel-icons'
import EditNotatfelt from '../etterlevelseMetadata/EditNotatfelt'

type EditEttlevProps = {
  temaName?: string
  etterlevelse: Etterlevelse
  kravId: KravId
  formRef?: React.Ref<any>
  documentEdit?: boolean
  etterlevelseDokumentasjonTitle?: string
  etterlevelseDokumentasjonId?: string
  etterlevelseNummer?: number
  behandlinger: Behandling[] | undefined
  teams: Team[] | undefined
  varsleMelding?: string
  navigatePath: string
  tidligereEtterlevelser: Etterlevelse[] | undefined
  kravFilter: KRAV_FILTER_TYPE
}

export const EditEtterlevelse = ({
  temaName,
  kravId,
  etterlevelse,
  varsleMelding,
  formRef,
  documentEdit,
  etterlevelseDokumentasjonTitle,
  etterlevelseDokumentasjonId,
  etterlevelseNummer,
  behandlinger,
  teams,
  navigatePath,
  tidligereEtterlevelser,
  kravFilter,
}: EditEttlevProps) => {
  const { data, loading } = useQuery<{ kravById: KravQL }, KravId>(query, {
    variables: kravId,
    skip: !kravId.id && !kravId.kravNummer,
    fetchPolicy: 'no-cache',
  })
  const etterlevelserLoading = loading
  const [krav, setKrav] = useState<KravQL>()
  const [nyereKrav, setNyereKrav] = React.useState<Krav>()
  const [disableEdit, setDisableEdit] = React.useState<boolean>(false)
  const [editedEtterlevelse, setEditedEtterlevelse] = React.useState<Etterlevelse>()
  const etterlevelseFormRef: React.Ref<FormikProps<Etterlevelse> | undefined> = useRef()
  const [isNotatModalOpen, setIsNotatModalOpen] = useState<boolean>(false)

  const [etterlevelseMetadata, setEtterlevelseMetadata] = useState<EtterlevelseMetadata>(
    mapEtterlevelseMetadataToFormValue({
      id: 'ny',
      etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
      kravNummer: kravId.kravNummer,
      kravVersjon: kravId.kravVersjon,
    }),
  )

  const navigate = useNavigate()

  useEffect(() => {
    ; (async () => {
      etterlevelseDokumentasjonId &&
        kravId.kravNummer &&
        getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion(etterlevelseDokumentasjonId, kravId.kravNummer, kravId.kravVersjon).then((resp) => {
          if (resp.content.length) {
            setEtterlevelseMetadata(resp.content[0])
          } else {
            setEtterlevelseMetadata(
              mapEtterlevelseMetadataToFormValue({
                id: 'ny',
                etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
                kravNummer: kravId.kravNummer,
                kravVersjon: kravId.kravVersjon,
              }),
            )
          }
        })
    })()
  }, [])

  const submit = async (etterlevelse: Etterlevelse) => {
    const mutatedEtterlevelse = {
      ...etterlevelse,
      fristForFerdigstillelse: etterlevelse.status !== EtterlevelseStatus.OPPFYLLES_SENERE ? '' : etterlevelse.fristForFerdigstillelse,
      suksesskriterieBegrunnelser: syncEtterlevelseKriterieBegrunnelseWithKrav(etterlevelse, krav),
    }

    //double check if etterlevelse already exist before submitting
    let existingEtterlevelseId = ''
    if (etterlevelseDokumentasjonId && krav) {
      const etterlevelseList = (await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(etterlevelseDokumentasjonId, krav.kravNummer)).content.filter(
        (e) => e.kravVersjon === krav.kravVersjon,
      )
      if (etterlevelseList.length) {
        existingEtterlevelseId = etterlevelseList[0].id
        mutatedEtterlevelse.id = etterlevelseList[0].id
      }
    }

    if (etterlevelse.id || existingEtterlevelseId) {
      await updateEtterlevelse(mutatedEtterlevelse).then(() => navigate(`/dokumentasjon/${etterlevelseDokumentasjonId}`))
    } else {
      await createEtterlevelse(mutatedEtterlevelse).then(() => {
        navigate(`/dokumentasjon/${etterlevelseDokumentasjonId}`)
      })
    }
  }

  useEffect(() => {
    if (data?.kravById) {
      setKrav(data.kravById)
      getKravByKravNumberAndVersion(data.kravById.kravNummer, data.kravById.kravVersjon + 1).then((krav) => {
        if (krav && krav.status === KravStatus.AKTIV) setNyereKrav(krav)
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
            <Detail className="font-bold">
              {temaName} / {krav.kravNummer}.{krav.kravVersjon}
            </Detail>
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

              {kravFilter === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV && (
                <BodyShort>
                  <strong>Kravet er bortfiltrert og derfor ikke relevant.</strong>
                </BodyShort>
              )}

              {kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV && (
                <BodyShort>
                  <strong>Kravet er utgått.</strong> Dere skal ikke dokumentere ny etterlevelse på dette kravet.
                </BodyShort>
              )}
            </div>
          </div>
          <div className="w-full flex">
            <div className="pr-4 flex flex-col gap-4 col-span-8">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    {krav.aktivertDato !== null && (
                      <Tag variant="warning">
                        {krav.kravVersjon > 1
                          ? `Ny versjon ${moment(krav.aktivertDato).format('ll')}`
                          : `Opprettet ${moment(krav.aktivertDato).format('ll')}`}
                      </Tag>
                    )}
                  </div>
                  {kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                    <div className="flex items-center gap-2">
                      <BodyShort size="small">
                        {etterlevelseMetadata && etterlevelseMetadata.tildeltMed && etterlevelseMetadata.tildeltMed.length >= 1 ? etterlevelseMetadata.tildeltMed[0] : 'Ikke tildelt'}
                      </BodyShort>
                      <Button
                        variant="tertiary"
                        size="small"
                        onClick={() => {
                          const ident = user.getName()
                          if (etterlevelseMetadata.tildeltMed && user.getName() === etterlevelseMetadata.tildeltMed[0] && etterlevelseMetadata.id !== 'ny') {
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
                        {etterlevelseMetadata.tildeltMed && user.getName() === etterlevelseMetadata.tildeltMed[0] ? 'Fjern meg selv' : 'Tildel meg selv'}
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

              <div className="p-4 rounded bg-purple-50">
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
                <Tabs.Panel value="dokumentasjon" className="flex flex-col gap-2 mt-2">
                  {
                    // todo: this heckin' component needs some care
                  }
                  <EtterlevelseEditFields
                    viewMode={kravFilter === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV ? true : false}
                    kravFilter={kravFilter}
                    krav={krav}
                    etterlevelse={etterlevelse}
                    submit={submit}
                    formRef={etterlevelseFormRef}
                    varsleMelding={varsleMelding}
                    disableEdit={disableEdit}
                    documentEdit={documentEdit}
                    close={() => {
                      setTimeout(() => navigate(`/dokumentasjon/${etterlevelseDokumentasjonId}`), 1)
                    }}
                    navigatePath={navigatePath}
                    editedEtterlevelse={editedEtterlevelse}
                    tidligereEtterlevelser={tidligereEtterlevelser}
                  />
                </Tabs.Panel>
                <Tabs.Panel value="etterlevelser" className="flex flex-col gap-2 mt-2">
                  <Etterlevelser loading={etterlevelserLoading} krav={krav} modalVersion />
                </Tabs.Panel>
                <Tabs.Panel value="tilbakemeldinger" className="flex flex-col gap-2 mt-2">
                  <Tilbakemeldinger krav={krav} hasKravExpired={false} />
                </Tabs.Panel>
              </Tabs>
            </div>
            <div className="pl-4 border-l border-border-divider max-w-sm">
              <Tabs defaultValue="notat" size="small">
                <Tabs.List>
                  <Tabs.Tab value="notat" label="Notat" />
                  <Tabs.Tab className="whitespace-nowrap" value="dokument" label="Om etterlevelsen" />
                  <Tabs.Tab className="whitespace-nowrap" value="mer" label="Mer om kravet" />
                </Tabs.List>
                <Tabs.Panel value="notat" className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between">
                    <Label className="flex gap-1"><FileTextIcon fontSize="1.5rem" />Notat</Label>
                    <Button
                      variant="secondary"
                      size="xsmall"
                      onClick={() => setIsNotatModalOpen(true)}
                    >
                      Rediger
                    </Button>

                    <EditNotatfelt
                      isOpen={isNotatModalOpen}
                      setIsNotatfeltOpen={setIsNotatModalOpen}
                      etterlevelseMetadata={etterlevelseMetadata}
                      setEtterlevelseMetadata={setEtterlevelseMetadata}
                    />
                  </div>
                  <BodyLong>{etterlevelseMetadata.notater}</BodyLong>
                </Tabs.Panel>
                <Tabs.Panel value="dokument" className="flex flex-col gap-2 mt-2">
                  <div>
                    <Label size="small">Tittel</Label>
                    <BodyShort>{etterlevelseDokumentasjonTitle}</BodyShort>
                  </div>
                  <div>
                    <Label size="small">Behandling</Label>
                    {behandlinger?.map((behandling) => (
                      <ExternalLink key={behandling.id} href={behandlingLink(behandling.id)}>
                        {behandling.navn}
                      </ExternalLink>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <Label size="small">Team</Label>
                    {teams?.map((team) => <TeamName id={team.id} big link />)}
                  </div>
                </Tabs.Panel>
                <Tabs.Panel value="mer" className="flex flex-col gap-2 mt-2">
                  <AllInfo krav={krav} alleKravVersjoner={[{ kravNummer: krav.kravNummer, kravVersjon: krav.kravVersjon, kravStatus: krav.status }]} />
                </Tabs.Panel>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
