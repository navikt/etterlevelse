'use client'

import { IEtterlevelse } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import { Alert, Checkbox, CheckboxGroup, Heading, Tabs, ToggleGroup } from '@navikt/ds-react'
import { FormikProps } from 'formik'
import { Dispatch, FunctionComponent, RefObject, SetStateAction, useContext, useState } from 'react'
import UnsavedEtterlevelseModal from '../modal/unsavedEtterlevelseModal'

type TProps = {
  isTabAlertActive: boolean
  setIsTabAlertActive: (state: boolean) => void
  isPvkTabActive: boolean
  isPvoUnderarbeidWarningActive: boolean
  isPreview: boolean
  setIsPreview: Dispatch<SetStateAction<boolean>>
  isPrioritised: boolean
  setIsPrioritised: Dispatch<SetStateAction<boolean>>
  etterlevelseFormRef: RefObject<FormikProps<IEtterlevelse> | null | undefined>
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
}

export const EtterlevelsePageTabs: FunctionComponent<TProps> = ({
  isTabAlertActive,
  setIsTabAlertActive,
  isPvkTabActive,
  isPvoUnderarbeidWarningActive,
  isPreview,
  setIsPreview,
  isPrioritised,
  setIsPrioritised,
  etterlevelseFormRef,
  etterlevelseDokumentasjon,
}) => {
  const user = useContext(UserContext)
  const [currentTab, setCurrentTab] = useState<string>('dokumentasjon')
  const [selectedTab, setSelectedTab] = useState<string>('dokumentasjon')
  const [isSavingChanges, setIsSavingChanges] = useState<boolean>(false)

  const handleChange = (value: string[]) => setIsPrioritised(value.includes('check'))

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

              {/*                        <EtterlevelseEditFields
                          isPreview={isPreview}
                          kravFilter={kravFilter}
                          krav={krav}
                          etterlevelse={etterlevelse}
                          submit={submit}
                          formRef={etterlevelseFormRef}
                          varsleMelding={varsleMelding}
                          disableEdit={disableEdit}
                          close={() => {
                            setTimeout(
                              () =>
                                navigate(
                                  etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id)
                                ),
                              1
                            )
                          }}
                          navigatePath={navigatePath}
                          editedEtterlevelse={editedEtterlevelse}
                          tidligereEtterlevelser={tidligereEtterlevelser}
                          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                        />*/}
            </div>
          )}
          {/*                  {!etterlevelseDokumentasjon?.hasCurrentUserAccess && !user.isAdmin() && (

                   <EtterlevelseViewFields
                      etterlevelse={etterlevelse}
                      suksesskriterier={krav.suksesskriterier}
                      tidligereEtterlevelser={tidligereEtterlevelser}
                    />
                  )}*/}
        </Tabs.Panel>
        <Tabs.Panel value='etterlevelser'>
          <div className='mt-2'>
            test
            {/*<Etterlevelser loading={etterlevelserLoading} krav={krav} modalVersion />*/}
          </div>
        </Tabs.Panel>
        <Tabs.Panel value='tilbakemeldinger'>
          <div className='mt-2'>
            test
            {/*<Tilbakemeldinger krav={krav} hasKravExpired={false} />*/}
          </div>
        </Tabs.Panel>
      </Tabs>
    </>
  )
}
export default EtterlevelsePageTabs
