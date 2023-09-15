import { Block } from 'baseui/block'
import { Spinner } from 'baseui/icon'
import { HeadingXLarge, HeadingXXLarge, ParagraphMedium } from 'baseui/typography'
import _ from 'lodash'
import moment from 'moment'
import { useState } from 'react'
import { Etterlevelse, EtterlevelseQL, EtterlevelseStatus, ExternalCode, Krav, KravQL } from '../../constants'
import { kravNumView } from '../../pages/KravPage'
import { theme } from '../../util'
import { ettlevColors, maxPageWidth, responsivePaddingExtraLarge } from '../../util/theme'
import Button from '../common/Button'
import { CustomizedAccordion, CustomizedPanel, CustomPanelDivider } from '../common/CustomizedAccordion'
import CustomizedModal from '../common/CustomizedModal'
import { InfoBlock } from '../common/InfoBlock'
import { PanelButton, PanelLink } from '../common/PanelLink'
import { borderRadius, borderStyle, marginAll } from '../common/Style'
import { ViewEtterlevelse } from '../etterlevelse/ViewEtterlevelse'
import { sadFolderIcon } from '../Images'

export const Etterlevelser = ({ loading, krav, modalVersion }: { loading: boolean; krav: KravQL; modalVersion?: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [openEtterlse, setOpenEtterlevelse] = useState<EtterlevelseQL>()

  const etterlevelser = (krav.etterlevelser || [])
    .filter((e) => e.status === EtterlevelseStatus.FERDIG_DOKUMENTERT)
    .sort((a, b) => {
      if (a.etterlevelseDokumentasjon && b.etterlevelseDokumentasjon) {
        return a.etterlevelseDokumentasjon.title.localeCompare(b.etterlevelseDokumentasjon.title)
      } else {
        return -1
      }
    })
    .filter((e) => e.etterlevelseDokumentasjon && e.etterlevelseDokumentasjon.title !== 'LEGACY_DATA')

  etterlevelser.map((e) => {
    if (!e.etterlevelseDokumentasjon.teamsData || e.etterlevelseDokumentasjon.teamsData.length === 0) {
      e.etterlevelseDokumentasjon.teamsData = [{
        id: 'INGEN', name: 'Ingen team', description: 'ingen',
        tags: [],
        members: []
      }]
    }
  })


  const teams = _.sortedUniqBy(
    (etterlevelser
      ?.map((e) => e.etterlevelseDokumentasjon.teamsData && e.etterlevelseDokumentasjon.teamsData).flat()
      .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))
      .filter((team) => !!team) || []),
    (a) => a?.id,
  )

  return (
    <Block marginBottom="32px" width="100%">
      <HeadingXLarge maxWidth={'500px'}>Her kan du se hvordan andre team har dokumentert etterlevelse</HeadingXLarge>
      {loading && <Spinner size={theme.sizing.scale800} />}
      {!loading && !etterlevelser.length && (
        <InfoBlock icon={sadFolderIcon} alt={'Trist mappe ikon'} text={'Det er ikke dokumentert etterlevelse på dette kravet'} color={ettlevColors.red50} />
      )}

      <CustomizedAccordion accordion={false}>
        {teams.map((t) => {

          const teamEtterlevelser = etterlevelser?.filter((e) => e.etterlevelseDokumentasjon.teamsData && t && 
           e.etterlevelseDokumentasjon.teamsData.filter((team) => team.id === t.id).length > 0
          )

          const antall = teamEtterlevelser.length
          return (
            <CustomizedPanel key={t && t.id} title={t ? t.name ? t.name + ' ' + antall : t.id + ' ' + antall: ''} HeaderActiveBackgroundColor={ettlevColors.green50}>
              {teamEtterlevelser.map((e, i) => (
                <CustomPanelDivider key={e.id}>
                  {modalVersion ? (
                    <PanelButton
                      onClick={() => {
                        setOpenEtterlevelse({ ...e, etterlevelseDokumentasjonId: e.etterlevelseDokumentasjon.id })
                        setIsModalOpen(true)
                      }}
                      square
                      hideBorderBottom={i !== antall - 1}
                      useUnderline
                      title={
                        <>
                          <strong>
                            E{e.etterlevelseDokumentasjon.etterlevelseNummer}
                          </strong>
                          : {e.etterlevelseDokumentasjon.title}
                        </>
                      }
                      rightBeskrivelse={`Utfylt: ${moment(e.changeStamp.lastModifiedDate).format('ll')}`}
                      overrides={{
                        Block: {
                          style: {
                            ...borderStyle('hidden'),
                            maxWidth: '812px',
                          },
                        },
                      }}
                    // panelIcon={(hover) => <PageIcon hover={hover} />}
                    />
                  ) : (
                    <PanelLink
                      href={`/etterlevelse/${e.id}`}
                      square
                      hideBorderBottom={i !== antall - 1}
                      useUnderline
                      title={
                        <>
                          <strong>
                            E{e.etterlevelseDokumentasjon.etterlevelseNummer}
                          </strong>
                          : {e.etterlevelseDokumentasjon.title} 
                        </>
                      }
                      rightBeskrivelse={`Utfylt: ${moment(e.changeStamp.lastModifiedDate).format('ll')}`}
                      overrides={{
                        Block: {
                          style: {
                            ...borderStyle('hidden'),
                          },
                        },
                      }}
                    // panelIcon={(hover) => <PageIcon hover={hover} />}
                    />
                  )}
                </CustomPanelDivider>
              ))}
            </CustomizedPanel>
          )
        })}
      </CustomizedAccordion>

      {modalVersion && openEtterlse && krav && <EtterlevelseModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} etterlevelse={openEtterlse} kravData={krav} />}
    </Block>
  )
}

export const EtterlevelseModal = ({
  isModalOpen,
  setIsModalOpen,
  etterlevelse,
  kravData,
}: {
  isModalOpen: boolean
  setIsModalOpen: (state: boolean) => void
  etterlevelse: Etterlevelse
  kravData: Krav
}) => {
  return (
    <CustomizedModal
      onClose={() => setIsModalOpen(false)}
      closeIconColor={ettlevColors.white}
      closeIconHoverColor={ettlevColors.green100}
      isOpen={isModalOpen}
      size="full"
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
        <Block backgroundColor={ettlevColors.green800} paddingTop="32px" paddingBottom="32px">
          <Block paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
            <ParagraphMedium
              $style={{
                marginTop: '0px',
                marginBottom: '0px',
                color: ettlevColors.white,
              }}
            >
              {kravNumView(kravData)}
            </ParagraphMedium>
            <HeadingXXLarge $style={{ marginTop: '0px', marginBottom: '0px', paddingBottom: '32px', color: ettlevColors.white }}>{kravData.navn}</HeadingXXLarge>
          </Block>
        </Block>

        <Block paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
          <ViewEtterlevelse etterlevelse={etterlevelse} viewMode krav={kravData} modalVersion />
          <Block display="flex" justifyContent="flex-end" paddingBottom="31px" paddingTop="95px">
            <Button
              onClick={() => {
                setIsModalOpen(false)
              }}
            >
              Lukk visning
            </Button>
          </Block>
        </Block>
      </Block>
    </CustomizedModal>
  )
}

export default Etterlevelser
