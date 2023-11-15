import { Behandling, Etterlevelse, EtterlevelseMetadata, EtterlevelseStatus, Krav, KRAV_FILTER_TYPE, KravQL, KravStatus, Team } from '../../constants'
import { FormikProps } from 'formik'
import { createEtterlevelse, getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber, updateEtterlevelse } from '../../api/EtterlevelseApi'
import { Block } from 'baseui/block'
import React, { useEffect, useRef, useState } from 'react'
import { theme } from '../../util'
import { getKravByKravNumberAndVersion, KravId } from '../../api/KravApi'
import { kravNumView, query } from '../../pages/KravPage'
import { HeadingXLarge, HeadingXXLarge, LabelSmall, ParagraphMedium } from 'baseui/typography'
import { ettlevColors, maxPageWidth, responsivePaddingExtraLarge } from '../../util/theme'
import { user } from '../../services/User'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { borderColor, borderRadius, borderStyle, borderWidth, marginAll, padding } from '../common/Style'
import { useQuery } from '@apollo/client'
import { informationIcon, warningAlert } from '../Images'
import CustomizedTabs from '../common/CustomizedTabs'
import { Tilbakemeldinger } from '../krav/tilbakemelding/Tilbakemelding'
import Etterlevelser from '../krav/Etterlevelser'
import { Markdown } from '../common/Markdown'
import {
  createEtterlevelseMetadata,
  getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion,
  mapEtterlevelseMetadataToFormValue,
  updateEtterlevelseMetadata,
} from '../../api/EtterlevelseMetadataApi'
import TildeltPopoever from '../etterlevelseMetadata/TildeltPopover'
import CustomizedModal from '../common/CustomizedModal'
import { ampli } from '../../services/Amplitude'
import StatusView from '../common/StatusTag'
import { getPageWidth } from '../../util/pageWidth'
import { useNavigate, useParams } from 'react-router-dom'
import { getFilterType, Section } from '../../pages/EtterlevelseDokumentasjonPage'
import { syncEtterlevelseKriterieBegrunnelseWithKrav } from '../etterlevelseDokumentasjonTema/common/utils'
import EtterlevelseEditFields from './Edit/EtterlevelseEditFields'
import moment from 'moment'
import { BodyLong, BodyShort, Button, Detail, Heading, Label, Tabs } from '@navikt/ds-react'
import { behandlingLink, teamKatTeamLink } from '../../util/config'
import { ExternalLink } from '../common/RouteLink'
import { useTeam } from '../../api/TeamApi'
import { TeamName } from '../common/TeamName'
import { AllInfo } from '../krav/ViewKrav'
import { FileTextIcon } from '@navikt/aksel-icons'

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
  setNavigatePath: (state: string) => void
  tab: Section
  setTab: (s: Section) => void
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
  setNavigatePath,
  tidligereEtterlevelser,
  tab,
  setTab,
  kravFilter,
}: EditEttlevProps) => {
  const params = useParams<{ id: string; tema: string; kravNummer: string; kravVersjon: string; filter: string }>()
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
  const [pageWidth, setPageWidth] = useState<number>(1276)

  const [etterlevelseMetadata, setEtterlevelseMetadata] = useState<EtterlevelseMetadata>(
    mapEtterlevelseMetadataToFormValue({
      id: 'ny',
      etterlevelseDokumentasjonId: etterlevelseDokumentasjonId,
      kravNummer: kravId.kravNummer,
      kravVersjon: kravId.kravVersjon,
    }),
  )

  const [isVersjonEndringerModalOpen, setIsVersjonEndringerModalOpen] = React.useState<boolean>(false)

  const [isAlertUnsavedModalOpen, setIsAlertUnsavedModalOpen] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
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

  useEffect(() => {
    const reportWindowSize = () => {
      setPageWidth(getPageWidth())
    }
    window.onload = reportWindowSize
    window.onresize = reportWindowSize
  })

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
            <div className="flex gap-4 items-center">
              <Heading size="medium" level="1">
                {krav.navn}
              </Heading>
            </div>
          </div>
          {
            // todo: remove all of the stuff in the commented out section below once we're sure we have
            // replicated everything we want/need
          }
          {/* <Block backgroundColor={ettlevColors.green800} paddingTop="32px" paddingBottom="32px">
            <Block paddingLeft="200px" paddingRight="200px">
              <Block display={'flex'}>
                <ParagraphMedium
                  $style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    color: ettlevColors.white,
                  }}
                >
                  {temaName} / {kravNumView(krav)}
                </ParagraphMedium>
                {kravFilter !== KRAV_FILTER_TYPE.RELEVANTE_KRAV && <StatusView status={kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV ? 'Utgått' : 'Bortfiltrert'} />}
              </Block>
              <HeadingXXLarge $style={{ marginTop: '0px', marginBottom: '0px', color: ettlevColors.white }}>{krav.navn}</HeadingXXLarge>
              {krav.aktivertDato !== null && (
                <Detail className="text-white">
                  {krav.kravVersjon > 1
                    ? `Ny versjon av kravet ble publisert ${moment(krav.aktivertDato).format('ll')}`
                    : `Kravet ble opprettet ${moment(krav.aktivertDato).format('ll')}`}
                </Detail>
              )}
              {kravFilter === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV && (
                <ParagraphMedium
                  $style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    paddingBottom: '32px',
                    color: ettlevColors.white,
                    lineHeight: '22px',
                    maxWidth: '650px',
                  }}
                >
                  <strong>Kravet er bortfiltrert og derfor ikke relevant.</strong>
                </ParagraphMedium>
              )}

              {kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV && (
                <ParagraphMedium
                  $style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    paddingBottom: '32px',
                    color: ettlevColors.white,
                    lineHeight: '22px',
                    maxWidth: '650px',
                  }}
                >
                  <strong>Kravet er utgått.</strong> Dere skal ikke dokumentere ny etterlevelse på dette kravet.
                </ParagraphMedium>
              )}

              {tidligereEtterlevelser && tidligereEtterlevelser.length >= 1 && kravFilter !== KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV && (
                <Block
                  width="fit-content"
                  display="flex"
                  backgroundColor="transparent"
                  $style={{
                    marginTop: '16px',
                  }}
                >
                  {etterlevelse.id === '' && (
                    <>
                      <img
                        src={warningAlert}
                        alt="warning icon"
                        width="24px"
                        height="24px"
                        style={{
                          marginRight: '5px',
                        }}
                      />
                      <ParagraphMedium
                        $style={{
                          lineHeight: '22px',
                          marginTop: '0px',
                          marginBottom: '0px',
                          fontWeight: 600,
                          color: ettlevColors.white,
                        }}
                      >
                        Dette er en ny versjon.
                      </ParagraphMedium>
                    </>
                  )}
                  {krav.versjonEndringer && (
                    <Button
                      type="button"
                      kind="underline-hover"
                      $style={{
                        marginLeft: '2px',
                        ':hover': { textDecoration: 'none' },
                      }}
                      onClick={() => setIsVersjonEndringerModalOpen(true)}
                    >
                      <ParagraphMedium
                        $style={{
                          lineHeight: '22px',
                          marginTop: '0px',
                          marginBottom: '0px',
                          fontWeight: 600,
                          color: ettlevColors.white,
                          textDecoration: 'underline',
                        }}
                      >
                        Se hva som er nytt fra forrige versjon.
                      </ParagraphMedium>
                    </Button>
                  )}
                </Block>
              )}

              {varsleMelding && (
                <Block
                  width="fit-content"
                  display="flex"
                  backgroundColor={'#E5F0F7'}
                  $style={{
                    ...padding('12px', '16px'),
                    ...borderColor('#005B82'),
                    ...borderWidth('1px'),
                    ...borderStyle('solid'),
                    ...borderRadius('4px'),
                    marginTop: '16px',
                  }}
                >
                  <img src={informationIcon} alt="information icon" width={'24px'} height={'24px'} />
                  <ParagraphMedium marginLeft={theme.sizing.scale500} marginTop="0px" marginBottom="0px">
                    {varsleMelding}
                  </ParagraphMedium>
                </Block>
              )}

              {kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                <Block display="flex" justifyContent="flex-start" alignItems="center" marginTop="32px">
                  <LabelSmall $style={{ color: ettlevColors.white, fontSize: '18px', lineHeight: '14px', textAlign: 'right' }}>
                    Tildelt:{' '}
                    {etterlevelseMetadata && etterlevelseMetadata.tildeltMed && etterlevelseMetadata.tildeltMed.length >= 1 ? etterlevelseMetadata.tildeltMed[0] : 'Ikke tildelt'}
                  </LabelSmall>
                  <TildeltPopoever
                    etterlevelseMetadata={etterlevelseMetadata}
                    setEtterlevelseMetadata={setEtterlevelseMetadata}
                    icon={faChevronDown}
                    iconColor={ettlevColors.white}
                  />
                </Block>
              )}
            </Block>
          </Block> */}
          <div className="grid grid-cols-12">
            <div className="pr-4 flex flex-col gap-4 col-span-8">
              <div className="flex items-center justify-between">
                <div>
                  {
                    // todo: ny versjon + se hva som er nytt goes here
                    // the div should _always_ exist to push tildel-functions to the right side,
                    // so don't programmatically remove it
                  }
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

              <div className="bg-blue-50 p-4 rounded">
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
                    setIsAlertUnsavedModalOpen={setIsAlertUnsavedModalOpen}
                    isAlertUnsavedModalOpen={isAlertUnsavedModalOpen}
                    navigatePath={navigatePath}
                    setNavigatePath={setNavigatePath}
                    editedEtterlevelse={editedEtterlevelse}
                    tidligereEtterlevelser={tidligereEtterlevelser}
                    etterlevelseMetadata={etterlevelseMetadata}
                    setEtterlevelseMetadata={setEtterlevelseMetadata}
                  />
                </Tabs.Panel>
                <Tabs.Panel value="etterlevelser" className="flex flex-col gap-2 mt-2">
                  <Etterlevelser loading={etterlevelserLoading} krav={krav} modalVersion />
                </Tabs.Panel>
                <Tabs.Panel value="tilbakemeldinger" className="flex flex-col gap-2 mt-2">
                  <Tilbakemeldinger krav={krav} hasKravExpired={false} />
                </Tabs.Panel>
              </Tabs>

              <CustomizedModal
                onClose={() => setIsVersjonEndringerModalOpen(false)}
                isOpen={isVersjonEndringerModalOpen}
                size="full"
                closeIconColor={ettlevColors.white}
                closeIconHoverColor={ettlevColors.green100}
                overrides={{
                  Dialog: {
                    style: {
                      ...borderRadius('0px'),
                      ...marginAll('0px'),
                      width: '100%',
                      maxWidth: maxPageWidth,
                    },
                  },
                }}
              >
                <Block width="100%">
                  <Block
                    paddingTop="120px"
                    paddingBottom="40px"
                    backgroundColor={ettlevColors.green800}
                    paddingLeft={responsivePaddingExtraLarge}
                    paddingRight={responsivePaddingExtraLarge}
                  >
                    <LabelSmall color={ettlevColors.white}>
                      K{krav.kravNummer}.{krav.kravVersjon}
                    </LabelSmall>
                    <HeadingXXLarge marginTop="0px" marginBottom="0px" color={ettlevColors.white}>
                      {krav.navn}
                    </HeadingXXLarge>
                  </Block>
                  <Block marginBottom="55px" marginTop="40px" paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
                    <Block minHeight="300px">
                      <HeadingXLarge marginTop="0px" marginBottom="24px">
                        Dette er nytt fra forrige versjon
                      </HeadingXLarge>
                      <Markdown source={krav.versjonEndringer} />
                    </Block>
                    <Block display="flex" justifyContent="flex-end" width="100%" marginTop="38px">
                      <Button onClick={() => setIsVersjonEndringerModalOpen(false)}>Lukk visning</Button>
                    </Block>
                  </Block>
                </Block>
              </CustomizedModal>
            </div>
            <div className="pl-4 border-l border-border-divider col-span-4">
              <Tabs defaultValue="notat" size="small">
                <Tabs.List>
                  <Tabs.Tab value="notat" label="Notat" />
                  <Tabs.Tab className="whitespace-nowrap" value="dokument" label="Om etterlevelsen" />
                  <Tabs.Tab className="whitespace-nowrap" value="mer" label="Mer om kravet" />
                </Tabs.List>
                <Tabs.Panel value="notat" className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between">
                    <Label className="flex gap-1"><FileTextIcon fontSize="1.5rem" />Notat</Label>
                    <Button variant="secondary" size="xsmall">Rediger</Button>
                    {
                      // todo: the button above should open a modal for editing arbeidsnotat
                    }
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
                  {
                    // todo: formatting inside AllInfo seems weird right now, needs fixing
                  }
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
