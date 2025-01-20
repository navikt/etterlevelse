import { FileTextIcon } from '@navikt/aksel-icons'
import { Button, Label, Tabs } from '@navikt/ds-react'
import { Dispatch, useEffect, useState } from 'react'
import { IEtterlevelseMetadata, IKravVersjon, IPvkDokument, TKravQL } from '../../../constants'
import { Markdown } from '../../common/Markdown'
import EditNotatfelt from '../../etterlevelseMetadata/EditNotatfelt'
import { AllInfo } from '../../krav/ViewKrav'
import KravRisikoscenario from '../../risikoscenario/kravRisikoscenario/KravRisikoscenario'

interface IProps {
  krav: TKravQL
  pvkDokument?: IPvkDokument
  etterlevelseMetadata: IEtterlevelseMetadata
  setEtterlevelseMetadata: Dispatch<React.SetStateAction<IEtterlevelseMetadata>>
  alleKravVersjoner: IKravVersjon[]
  setIsPreview: (state: boolean) => void
}

export const EtterlevelseSidePanel = (props: IProps) => {
  const {
    krav,
    pvkDokument,
    etterlevelseMetadata,
    setEtterlevelseMetadata,
    alleKravVersjoner,
    setIsPreview,
  } = props
  const [isNotatModalOpen, setIsNotatModalOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('mer')

  useEffect(() => {
    if (pvkDokument && pvkDokument.skalUtforePvk) {
      setActiveTab('pvkDokumentasjon')
    }
  }, [pvkDokument])

  return (
    <div className="pl-4 border-l border-border-divider w-full max-w-lg">
      <Tabs
        defaultValue="mer"
        value={activeTab}
        size="small"
        onChange={(tabValue) => {
          setActiveTab(tabValue)
        }}
      >
        <Tabs.List>
          <Tabs.Tab className="whitespace-nowrap" value="mer" label="Mer om kravet" />
          {pvkDokument && pvkDokument.skalUtforePvk && (
            <Tabs.Tab
              className="whitespace-nowrap"
              value="pvkDokumentasjon"
              label="PVK-dokumentasjon"
            />
          )}
          <Tabs.Tab value="notat" label="Notat" />
        </Tabs.List>
        <Tabs.Panel value="mer">
          <div className="mt-2 p-4">
            <AllInfo krav={krav} alleKravVersjoner={alleKravVersjoner} />
          </div>
        </Tabs.Panel>
        {pvkDokument && pvkDokument.skalUtforePvk && (
          <Tabs.Panel value="pvkDokumentasjon">
            <div className="mt-2 p-4">
              <KravRisikoscenario
                krav={krav}
                pvkDokument={pvkDokument}
                setIsPreview={setIsPreview}
              />
            </div>
          </Tabs.Panel>
        )}
        <Tabs.Panel value="notat">
          <div className="mt-2 p-4">
            <div className="flex justify-between mb-2.5">
              <Label className="flex gap-1" size="medium">
                <FileTextIcon fontSize="1.5rem" area-label="" aria-hidden />
                Notat
              </Label>
              <Button variant="secondary" size="xsmall" onClick={() => setIsNotatModalOpen(true)}>
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
  )
}
export default EtterlevelseSidePanel
