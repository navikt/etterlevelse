'use client'

import {
  createEtterlevelse,
  getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber,
  updateEtterlevelse,
} from '@/api/etterlevelse/etterlevelseApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import { KravEtterlevelser } from '@/components/krav/kravPage/kravMainContent/kravTabMeny/kravEtterlevelse/kravEtterlevelse'
import { KravTilbakemeldinger } from '@/components/krav/kravPage/kravMainContent/kravTabMeny/kravTilbakemelding/kravTilbakemelding'
import AlertPvoUnderarbeidModal from '@/components/pvoTilbakemelding/alertPvoUnderarbeidModal'
import {
  EEtterlevelseStatus,
  IEtterlevelse,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { UserContext } from '@/provider/user/userProvider'
import { syncEtterlevelseKriterieBegrunnelseWithKrav } from '@/util/etterlevelseUtil/etterlevelseUtil'
import { Alert, Checkbox, CheckboxGroup, Heading, Tabs, ToggleGroup } from '@navikt/ds-react'
import { FormikProps } from 'formik'
import { useParams } from 'next/navigation'
import { Dispatch, FunctionComponent, RefObject, SetStateAction, useContext, useState } from 'react'
import { EtterlevelseViewFields } from '../../readOnly/etterlevelseViewFields'
import { EtterlevelseEditFields } from '../form/EtterlevelseEditFields'
import ChangesSavedEttelevelseModal from '../modal/changesSavedEttelevelseModal'
import UnsavedEtterlevelseModal from '../modal/unsavedEtterlevelseModal'

type TProps = {
  krav: TKravQL
  etterlevelse: IEtterlevelse
  setEtterlevelse: Dispatch<SetStateAction<IEtterlevelse | undefined>>
  alleKravVersjoner: IKravVersjon[]
  tidligereEtterlevelser: IEtterlevelse[] | undefined
  disableEdit: boolean
  nextKravToDocument: string
  isTabAlertActive: boolean
  setIsTabAlertActive: (state: boolean) => void
  isPvkTabActive: boolean
  isPvoUnderarbeidWarningActive: boolean
  isPreview: boolean
  setIsPreview: Dispatch<SetStateAction<boolean>>
  isPrioritised: boolean
  setIsPrioritised: Dispatch<SetStateAction<boolean>>
  isSavingChanges: boolean
  setIsSavingChanges: (state: boolean) => void
  etterlevelseFormRef: RefObject<FormikProps<IEtterlevelse> | null | undefined>
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  pvkDokument?: IPvkDokument
}

export const EtterlevelsePageTabs: FunctionComponent<TProps> = ({
  krav,
  pvkDokument,
  etterlevelse,
  setEtterlevelse,
  alleKravVersjoner,
  tidligereEtterlevelser,
  disableEdit,
  nextKravToDocument,
  isTabAlertActive,
  setIsTabAlertActive,
  isPvkTabActive,
  isPvoUnderarbeidWarningActive,
  isPreview,
  setIsPreview,
  isPrioritised,
  setIsPrioritised,
  isSavingChanges,
  setIsSavingChanges,
  etterlevelseFormRef,
  etterlevelseDokumentasjon,
}) => {
  const params: Readonly<
    Partial<{
      tema?: string
    }>
  > = useParams<{ tema?: string }>()
  const user = useContext(UserContext)
  const [currentTab, setCurrentTab] = useState<string>('dokumentasjon')
  const [selectedTab, setSelectedTab] = useState<string>('dokumentasjon')
  const [statusText, setStatustext] = useState<string>('')
  const [isNavigationModalOpen, setIsNavigationModalOpen] = useState<boolean>(false)
  const [hasNextKrav, setHasNextKrav] = useState<boolean>(true)
  const [editedEtterlevelse, setEditedEtterlevelse] = useState<IEtterlevelse>()
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)

  const handleChange = (value: string[]) => setIsPrioritised(value.includes('check'))

  const activeAlertModalController = () => {
    if (isTabAlertActive) {
      setIsSavingChanges(false)
      setIsTabAlertActive(false)
    } else {
      setIsNavigationModalOpen(true)
    }
  }

  const submit = async (etterlevelse: IEtterlevelse) => {
    const mutatedEtterlevelse = {
      ...etterlevelse,
      fristForFerdigstillelse:
        etterlevelse.status !== EEtterlevelseStatus.OPPFYLLES_SENERE
          ? ''
          : etterlevelse.fristForFerdigstillelse,
      suksesskriterieBegrunnelser: syncEtterlevelseKriterieBegrunnelseWithKrav(etterlevelse, krav),
      prioritised: isPrioritised,
    } as IEtterlevelse
    setEditedEtterlevelse(mutatedEtterlevelse)

    //double check if etterlevelse already exist before submitting
    let existingEtterlevelseId = ''
    if (etterlevelseDokumentasjon && krav) {
      const etterlevelseList = (
        await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(
          etterlevelseDokumentasjon.id,
          krav.kravNummer
        )
      ).content.filter((e) => e.kravVersjon === krav.kravVersjon)
      if (etterlevelseList.length) {
        existingEtterlevelseId = etterlevelseList[0].id
        mutatedEtterlevelse.id = etterlevelseList[0].id
      }
    }

    await getPvkDokumentByEtterlevelseDokumentId(etterlevelse.etterlevelseDokumentasjonId).then(
      async (response) => {
        if (
          response &&
          [EPvkDokumentStatus.PVO_UNDERARBEID, EPvkDokumentStatus.SENDT_TIL_PVO].includes(
            response.status
          ) &&
          krav?.tagger.includes('Personvernkonsekvensvurdering')
        ) {
          setIsPvoAlertModalOpen(true)
        } else {
          if (etterlevelse.id || existingEtterlevelseId) {
            await updateEtterlevelse(mutatedEtterlevelse).then((res) => {
              if (nextKravToDocument !== '') {
                setStatustext(res.status)
                setHasNextKrav(true)
                activeAlertModalController()
              } else {
                setStatustext(res.status)
                setHasNextKrav(false)
                activeAlertModalController()
                setEtterlevelse(res)
              }
            })
          } else {
            await createEtterlevelse(mutatedEtterlevelse).then((res) => {
              if (nextKravToDocument !== '') {
                setStatustext(res.status)
                setHasNextKrav(true)
                activeAlertModalController()
              } else {
                setStatustext(res.status)
                setHasNextKrav(false)
                activeAlertModalController()
                setEtterlevelse(res)
              }
            })
          }
        }
      }
    )
  }

  return (
    <>
      {isTabAlertActive && (
        <UnsavedEtterlevelseModal
          isTabAlertActive={isTabAlertActive}
          setIsTabAlertActive={setIsTabAlertActive}
          isSavingChanges={isSavingChanges}
          setIsSavingChanges={setIsSavingChanges}
          selectedTab={selectedTab}
          setCurrentTab={setCurrentTab}
          etterlevelseFormRef={etterlevelseFormRef}
        />
      )}

      {isNavigationModalOpen && !isTabAlertActive && (
        <ChangesSavedEttelevelseModal
          isNavigationModalOpen={isNavigationModalOpen}
          isTabAlertActive={isTabAlertActive}
          setIsNavigationModalOpen={setIsNavigationModalOpen}
          statusText={statusText}
          hasNextKrav={hasNextKrav}
          nextKravToDocument={nextKravToDocument}
          etterlevelseDokumentasjonId={etterlevelseDokumentasjon?.id}
          temaCode={params.tema}
        />
      )}

      {pvkDokument && isPvoAlertModalOpen && (
        <AlertPvoUnderarbeidModal
          isOpen={isPvoAlertModalOpen}
          onClose={() => setIsPvoAlertModalOpen(false)}
          pvkDokumentId={pvkDokument.id}
        />
      )}

      <Tabs
        value={currentTab}
        onChange={(tabValue) => {
          setSelectedTab(tabValue)
          if (etterlevelseFormRef.current?.dirty) {
            setIsTabAlertActive(true)
          } else {
            setCurrentTab(tabValue)
          }
        }}
      >
        <Tabs.List>
          <Tabs.Tab
            value='dokumentasjon'
            label={
              <Heading level='2' size='small'>
                Dokumentasjon
              </Heading>
            }
          />
          <Tabs.Tab
            value='etterlevelser'
            label={
              <Heading level='2' size='small'>
                Hvordan har andre gjort det?
              </Heading>
            }
          />
          <Tabs.Tab
            value='tilbakemeldinger'
            label={
              <Heading level='2' size='small'>
                Spørsmål og svar
              </Heading>
            }
          />
        </Tabs.List>
        <Tabs.Panel value='dokumentasjon'>
          {(etterlevelseDokumentasjon?.hasCurrentUserAccess || user.isAdmin()) &&
            !isPvkTabActive &&
            !isPvoUnderarbeidWarningActive && (
              <ToggleGroup
                className='mt-6'
                defaultValue='OFF'
                value={isPreview ? 'ON' : 'OFF'}
                onChange={(value) => setIsPreview(value === 'ON' ? true : false)}
              >
                <ToggleGroup.Item value='OFF' label='Redigeringsvisning' />
                <ToggleGroup.Item value='ON' label='Forhåndsvisning' />
              </ToggleGroup>
            )}

          {isPvoUnderarbeidWarningActive && (
            <Alert className='mt-6' variant='info'>
              Kan ikke redigeres når personvernombudet har påbegynt vurderingen
            </Alert>
          )}

          {isPvkTabActive && (
            <Alert className='mt-6' variant='info'>
              Kan ikke redigeres når PVK skjema er aktiv på sidepanelet
            </Alert>
          )}
          {(etterlevelseDokumentasjon?.hasCurrentUserAccess || user.isAdmin()) && (
            <div className='mt-2'>
              {!isPreview && (
                <CheckboxGroup
                  legend='Legg til i Prioritert kravliste'
                  hideLegend
                  onChange={handleChange}
                  value={isPrioritised ? ['check'] : []}
                >
                  {
                    <Checkbox
                      value='check'
                      description={
                        (((etterlevelseDokumentasjon?.hasCurrentUserAccess &&
                          etterlevelseDokumentasjon?.forGjenbruk) ||
                          (etterlevelseDokumentasjon?.forGjenbruk && user.isAdmin())) &&
                          'De som gjenbruker etterlevelsesdokumentet ditt vil få fremhevet kravet når de foretar sin egen vurdering') ||
                        ''
                      }
                    >
                      Legg til dette kravet i Prioritert kravliste
                    </Checkbox>
                  }
                </CheckboxGroup>
              )}

              <EtterlevelseEditFields
                isPreview={isPreview}
                krav={krav}
                etterlevelse={etterlevelse}
                submit={submit}
                formRef={etterlevelseFormRef}
                disableEdit={disableEdit}
                editedEtterlevelse={editedEtterlevelse}
                tidligereEtterlevelser={tidligereEtterlevelser}
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              />
            </div>
          )}
          {!etterlevelseDokumentasjon?.hasCurrentUserAccess && !user.isAdmin() && (
            <EtterlevelseViewFields
              etterlevelse={etterlevelse}
              suksesskriterier={krav.suksesskriterier}
              tidligereEtterlevelser={tidligereEtterlevelser}
            />
          )}
        </Tabs.Panel>
        <Tabs.Panel value='etterlevelser'>
          <div className='mt-2'>
            <KravEtterlevelser loading={false} krav={krav} modalVersion />
          </div>
        </Tabs.Panel>
        <Tabs.Panel value='tilbakemeldinger'>
          <div className='mt-2'>
            <KravTilbakemeldinger krav={krav} alleKravVersjoner={alleKravVersjoner} />
          </div>
        </Tabs.Panel>
      </Tabs>
    </>
  )
}
export default EtterlevelsePageTabs
