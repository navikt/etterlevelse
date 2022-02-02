import { Block } from 'baseui/block'
import { Spinner } from 'baseui/icon'
import { HeadingXLarge } from 'baseui/typography'
import _ from 'lodash'
import moment from 'moment'
import { EtterlevelseQL, EtterlevelseStatus, ExternalCode } from '../../constants'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import { CustomizedAccordion, CustomizedPanel, CustomPanelDivider } from '../common/CustomizedAccordion'
import { InfoBlock } from '../common/InfoBlock'
import { PanelLink } from '../common/PanelLink'
import { borderStyle } from '../common/Style'
import { sadFolderIcon } from '../Images'

export const Etterlevelser = ({ loading, etterlevelser: allEtterlevelser }: { loading: boolean; etterlevelser?: EtterlevelseQL[] }) => {
  const etterlevelser = (allEtterlevelser || [])
    .filter((e) => e.status === EtterlevelseStatus.FERDIG_DOKUMENTERT)
    .sort((a, b) => a.behandling.navn.localeCompare(b.behandling.navn))

  etterlevelser.map((e) => {
    if (!e.behandling.avdeling) {
      e.behandling.avdeling = { code:'INGEN', shortName: 'Ingen avdeling' } as ExternalCode
    }
  })

  const avdelinger = _.sortedUniqBy(
    (etterlevelser
      ?.map((e) => e.behandling.avdeling)
      .sort((a, b) => (a?.shortName || '').localeCompare(b?.shortName || ''))
      .filter((avdeling) => !!avdeling) || []) as ExternalCode[],
    (a) => a.code,
  )

  return (
    <Block marginBottom="32px">
      <HeadingXLarge maxWidth={'500px'}>Her kan du se hvordan andre team har dokumentert etterlevelse</HeadingXLarge>
      {loading && <Spinner size={theme.sizing.scale800} />}
      {!loading && !etterlevelser.length && (
        <InfoBlock icon={sadFolderIcon} alt={'Trist mappe ikon'} text={'Det er ikke dokumentert etterlevelse på dette kravet'} color={ettlevColors.red50} />
      )}

      <CustomizedAccordion accordion={false}>
        {avdelinger.map((a) => {
          const avdelingEtterlevelser = etterlevelser?.filter((e) => e.behandling.avdeling?.code === a.code)
          const antall = avdelingEtterlevelser.length
          return (
            <CustomizedPanel key={a.code} title={a.shortName} HeaderActiveBackgroundColor={ettlevColors.green50}>
              {avdelingEtterlevelser.map((e, i) => (
                <CustomPanelDivider>
                  <PanelLink
                    key={e.id}
                    href={`/etterlevelse/${e.id}`}
                    square
                    hideBorderBottom={i !== antall - 1}
                    useUnderline
                    title={
                      <>
                        <strong>
                          {e.behandling.nummer}-{e.behandling.overordnetFormaal.shortName}
                        </strong>
                        : {e.behandling.navn}
                      </>
                    }
                    rightTitle={!!e.behandling.teamsData.length ? e.behandling.teamsData.map((t) => t.name).join(', ') : 'Ingen team'}
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
                </CustomPanelDivider>
              ))}
            </CustomizedPanel>
          )
        })}
      </CustomizedAccordion>
    </Block>
  )
}

export default Etterlevelser
