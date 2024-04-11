import { BodyShort, Heading, Link } from '@navikt/ds-react'
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
          <BodyShort>Du er ikke medlem av team med registrerte dokumentasjoner</BodyShort>
        )}

        {teams.map((team) => {
          const teamDokumentasjoner = etterlevelseDokumentasjoner
            .filter((e) => e.teamsData?.find((t2) => t2.id === team.id))
            .filter(
              (value, index, self) =>
                index ===
                self.findIndex(
                  (etterlevelseDokumentasjon) => etterlevelseDokumentasjon.id === value.id
                )
            )
          return (
            <div key={team.id} className="mb-8">
              <div className="flex justify-between">
                <div>
                  <Heading size="small" level="2">
                    {team.name}
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
              </div>

              <EtterlevelseDokumentasjonsPanels etterlevelseDokumentasjoner={teamDokumentasjoner} />
            </div>
          )
        })}

        <div className="max-w-[50rem] mt-48">
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
