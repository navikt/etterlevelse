import { BodyShort, Heading, Link } from '@navikt/ds-react'
import { ParagraphSmall } from 'baseui/typography'
import { TEtterlevelseDokumentasjonQL } from '../../../constants'
import { TCustomTeamObject } from '../../../pages/MyEtterlevelseDokumentasjonerPage'
import { env } from '../../../util/env'
import { ettlevColors } from '../../../util/theme'
import { bamseIcon } from '../../Images'
import { InfoBlock2 } from '../../common/InfoBlock'
import { EtterlevelseDokumentasjonsPanels } from '../EtterlevelseDokumentasjonsPanels'

export const MineEtterlevelseDokumentasjoner = ({
  etterlevelseDokumentasjoner,
  teams,
  loading,
}: {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
  teams: TCustomTeamObject[]
  loading: boolean
}) => (
  <div className="my-5">
    {loading && (
      <div>
        <EtterlevelseDokumentasjonsPanels etterlevelseDokumentasjoner={[]} loading />
        <div className="h-16" />
        <EtterlevelseDokumentasjonsPanels etterlevelseDokumentasjoner={[]} loading />
      </div>
    )}

    {!loading && (
      <div>
        {!etterlevelseDokumentasjoner.length && !teams.length && (
          <ParagraphSmall>Du er ikke medlem av team med registrerte dokumentasjoner</ParagraphSmall>
        )}

        {teams.map((t) => {
          const teamDokumentasjoner = etterlevelseDokumentasjoner
            .filter((e) => e.teamsData?.find((t2) => t2.id === t.id))
            .filter(
              (value, index, self) =>
                index ===
                self.findIndex(
                  (etterlevelseDokumentasjon) => etterlevelseDokumentasjon.id === value.id
                )
            )
          return (
            <div key={t.id} className="mb-8">
              <div className="flex justify-between">
                <div>
                  <Heading size="small" level="2">
                    {t.name}
                  </Heading>
                  {etterlevelseDokumentasjoner.length > 0 && (
                    <BodyShort className="mb-2">
                      Teamet skal etterleve krav i{' '}
                      <span style={{ fontWeight: 700 }}>
                        {teamDokumentasjoner.length} dokumentasjoner
                      </span>
                    </BodyShort>
                  )}

                  {!etterlevelseDokumentasjoner.length && (
                    <BodyShort>Teamet har ikke registrert noe etterlevelsesdokument</BodyShort>
                  )}
                </div>
                {/* <Block alignSelf={'flex-end'} marginBottom={theme.sizing.scale400}>
                  <ExternalButton href={`${env.pollyBaseUrl}process/team/${t.id}`} underlineHover size={'mini'}>
                    Legg til behandling <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </ExternalButton>
                </Block> */}
              </div>

              <EtterlevelseDokumentasjonsPanels etterlevelseDokumentasjoner={teamDokumentasjoner} />
            </div>
          )
        })}

        <div className="max-w-[800px] mt-48">
          <InfoBlock2
            icon={bamseIcon}
            alt={'Bamseikon'}
            title={'Savner du teamet ditt?'}
            beskrivelse={
              'Legg til teamet i teamkatalogen, så henter vi dokumentasjoner som skal etterleve krav'
            }
            backgroundColor={ettlevColors.grey25}
          >
            <div className="mt-4">
              <Link href={`${env.teamKatBaseUrl}`}>Teamkatalogen (åpnes i ny fane)</Link>
            </div>
          </InfoBlock2>
        </div>
      </div>
    )}
  </div>
)
