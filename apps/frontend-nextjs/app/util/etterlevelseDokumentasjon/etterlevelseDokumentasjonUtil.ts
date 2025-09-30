import {
  IEtterlevelseDokumentasjon,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IMember, ITeam, ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'

export const etterlevelseDokumentasjonName = (
  etterlevelseDokumentasjon?: IEtterlevelseDokumentasjon
): string =>
  etterlevelseDokumentasjon
    ? `E${etterlevelseDokumentasjon.etterlevelseNummer} ${etterlevelseDokumentasjon.title}`
    : ''

export const getMembersFromEtterlevelseDokumentasjon = (
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
): string[] => {
  const members: string[] = []
  if (etterlevelseDokumentasjon.teamsData && etterlevelseDokumentasjon.teamsData.length > 0) {
    etterlevelseDokumentasjon.teamsData.forEach((team: ITeam) => {
      if (team.members) {
        const teamMembers: string[] = team.members.map((members: IMember) => members.navIdent || '')
        members.push(...teamMembers)
      }
    })
  }
  if (
    etterlevelseDokumentasjon.resourcesData &&
    etterlevelseDokumentasjon.resourcesData.length > 0
  ) {
    members.push(
      ...etterlevelseDokumentasjon.resourcesData.map((resource: ITeamResource) => resource.navIdent)
    )
  }

  return members
}
