'use client'

import { Markdown } from '@/components/common/markdown/markdown'
import { KravInfoView } from '@/components/krav/kravPage/kravInfoView/kravViewInfo'
import RisikoscenarioAccordianAlertModal from '@/components/risikoscenario/common/risikoscenarioAccordianAlertModal'
import KravRisikoscenarioer from '@/components/risikoscenario/kravSpesifikk/kravRisikoscenarioer'
import { IEtterlevelseMetadata } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseMetadataConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { UserContext } from '@/provider/user/userProvider'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { FileTextIcon } from '@navikt/aksel-icons'
import { Button, Heading, Label, Tabs } from '@navikt/ds-react'
import {
  Dispatch,
  FunctionComponent,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import EditNotatfelt from '../../etterlevelseMetadata/editNotatfelt'

type TProps = {
  krav: TKravQL
  pvkDokument?: IPvkDokument
  etterlevelseMetadata: IEtterlevelseMetadata
  setEtterlevelseMetadata: Dispatch<React.SetStateAction<IEtterlevelseMetadata>>
  alleKravVersjoner: IKravVersjon[]
  setIsPreview: (state: boolean) => void
  setIsPvkTabActive: (state: boolean) => void
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
}

export const EtterlevelseSidePanel: FunctionComponent<TProps> = ({
  krav,
  pvkDokument,
  etterlevelseMetadata,
  setEtterlevelseMetadata,
  alleKravVersjoner,
  setIsPreview,
  setIsPvkTabActive,
  etterlevelseDokumentasjon,
}) => {
  const user = useContext(UserContext)
  const [isNotatModalOpen, setIsNotatModalOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('mer')
  const [selectedTab, setSelectedTab] = useState<string>('')
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [isPvkFormActive, setIsPvkFormActive] = useState<boolean>(false)
  const formRef: RefObject<any> = useRef(undefined)

  const userHasAccess = () => {
    return user.isAdmin() || etterlevelseDokumentasjon?.hasCurrentUserAccess || false
  }

  useEffect(() => {
    if (
      pvkDokument &&
      pvkDokument.skalUtforePvk &&
      krav.tagger.includes('Personvernkonsekvensvurdering')
    ) {
      setActiveTab('pvkDokumentasjon')
    }
  }, [pvkDokument])

  useEffect(() => {
    if (isPvkFormActive) {
      setIsPreview(true)
      setIsPvkTabActive(true)
    } else {
      setIsPreview(false)
      setIsPvkTabActive(false)
    }
  }, [isPvkFormActive])

  return (
    <div className='pl-4 border-l border-[#071a3636] w-full max-w-lg'>
      <div className='sticky top-4'>
        <Tabs
          defaultValue='mer'
          value={activeTab}
          size='small'
          onChange={(tabValue) => {
            if (formRef.current?.dirty) {
              setSelectedTab(tabValue)
              setIsUnsaved(true)
            } else {
              setIsPvkFormActive(false)
              setActiveTab(tabValue)
            }
          }}
        >
          <Tabs.List>
            <Tabs.Tab
              className='whitespace-nowrap'
              value='mer'
              label={
                <Heading level='2' size='xsmall'>
                  Mer om kravet
                </Heading>
              }
            />
            {pvkDokument &&
              pvkDokument.skalUtforePvk &&
              krav.tagger.includes('Personvernkonsekvensvurdering') && (
                <Tabs.Tab
                  className='whitespace-nowrap'
                  value='pvkDokumentasjon'
                  label={
                    <Heading level='2' size='xsmall'>
                      PVK-dokumentasjon
                    </Heading>
                  }
                />
              )}
            <Tabs.Tab
              value='notat'
              label={
                <Heading level='2' size='xsmall'>
                  Notat
                </Heading>
              }
            />
          </Tabs.List>
          <Tabs.Panel value='mer'>
            <div className='mt-2 p-4'>
              <KravInfoView krav={krav} alleKravVersjoner={alleKravVersjoner} />
            </div>
          </Tabs.Panel>

          {pvkDokument && pvkDokument.skalUtforePvk && (
            <Tabs.Panel className='overflow-auto h-[90vh]' value='pvkDokumentasjon'>
              <div className='mt-2 p-4 mb-52'>
                {userHasAccess() && pvkDokument && !isReadOnlyPvkStatus(pvkDokument.status) && (
                  <KravRisikoscenarioer
                    krav={krav}
                    pvkDokument={pvkDokument}
                    setIsPvkFormActive={setIsPvkFormActive}
                    formRef={formRef}
                  />
                )}

                {(!userHasAccess() || (pvkDokument && isReadOnlyPvkStatus(pvkDokument.status))) &&
                  // <KravRisikoscenarioReadOnly krav={krav} pvkDokument={pvkDokument} />
                  'risikoscenario readonly'}
              </div>
            </Tabs.Panel>
          )}

          <Tabs.Panel className='overflow-auto h-[90vh]' value='notat'>
            <div className='mt-2 p-4'>
              <div className='flex justify-between mb-2.5'>
                <Label className='flex gap-1' size='medium'>
                  <FileTextIcon fontSize='1.5rem' area-label='' aria-hidden />
                  Notat
                </Label>
                <Button variant='secondary' size='xsmall' onClick={() => setIsNotatModalOpen(true)}>
                  Redigér
                </Button>
              </div>

              <EditNotatfelt
                isOpen={isNotatModalOpen}
                setIsNotatfeltOpen={setIsNotatModalOpen}
                etterlevelseMetadata={etterlevelseMetadata}
                setEtterlevelseMetadata={setEtterlevelseMetadata}
              />

              <div className='break-words'>
                <Markdown source={etterlevelseMetadata.notater} />
              </div>
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>

      <RisikoscenarioAccordianAlertModal
        isOpen={isUnsaved}
        setIsOpen={setIsUnsaved}
        formRef={formRef}
        customOnClick={() => {
          setActiveTab(selectedTab)
        }}
      />
    </div>
  )
}

export default EtterlevelseSidePanel
