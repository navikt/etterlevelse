import { InfoBlock2 } from '@/components/common/infoBlock/infoBlock'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { env } from '@/util/env/env'
import { ettlevColors } from '@/util/theme/theme'
import { BodyShort, Heading, Link } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { bamseIcon } from '../../image/image'
import { TCustomTeamObject } from '../dokumentasjonTabs'
import { EtterlevelseDokumentasjonsPanels } from '../panels/etterlevelseDokumentasjonPanels'

type TProps = {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
  teams: TCustomTeamObject[]
  loading: boolean
}

export const MineEtterlevelseDokumentasjoner: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjoner,
  teams,
  loading,
}) => (
  <div className='my-5'>
    {loading && (
      <div>
        <EtterlevelseDokumentasjonsPanels etterlevelseDokumentasjoner={[]} loading />
        <div className='h-16' />
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
            <div key={team.id} className='mb-8'>
              <div className='flex justify-between'>
                <div>
                  <Heading size='small' level='2'>
                    {team.name}
                  </Heading>
                  {etterlevelseDokumentasjoner.length > 0 && (
                    <BodyShort className='mb-2'>
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

        <div className='max-w-[50rem] mt-48'>
          <InfoBlock2
            icon={bamseIcon}
            alt={'Bamseikon'}
            title={'Savner du teamet ditt?'}
            beskrivelse={
              'Legg til teamet i teamkatalogen, så henter vi dokumentasjoner som skal etterleve krav'
            }
            backgroundColor={ettlevColors.grey25}
          >
            <div className='mt-4'>
              <Link
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Teamkatalogen'
                href={`${env.teamKatBaseUrl}`}
              >
                Teamkatalogen (åpner i en ny fane)
              </Link>
            </div>
          </InfoBlock2>
        </div>
      </div>
    )}
  </div>
)

export default MineEtterlevelseDokumentasjoner
