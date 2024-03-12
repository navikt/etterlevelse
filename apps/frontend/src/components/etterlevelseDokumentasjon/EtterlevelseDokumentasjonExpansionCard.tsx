import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyShort, ExpansionCard, Label, Tag } from '@navikt/ds-react'
import { TEtterlevelseDokumentasjonQL } from '../../constants'
import { EListName, ICode, codelist } from '../../services/Codelist'
import { BehandlingList } from '../behandling/BehandlingList'
import { Teams } from '../common/TeamName'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const EtterlevelseDokumentasjonExpansionCard = (props: IProps) => {
  const { etterlevelseDokumentasjon } = props

  const relevansCodeList = codelist.getParsedOptions(EListName.RELEVANS)

  const {
    etterlevelseNummer,
    title,
    behandlerPersonopplysninger,
    behandlingIds,
    behandlinger,
    teams,
    irrelevansFor,
  } = etterlevelseDokumentasjon

  const getRelevans = (irrelevans: ICode[]) => {
    const fargeForFemAlternativ = ['alt1', 'alt2', 'alt3', 'alt1', 'alt2'] as const
    const ingenEgenskaper: boolean = irrelevans.length === relevansCodeList.length

    const relevans = relevansCodeList.filter((relevans) => {
      const hentIder: string[] = irrelevans.map((irrelevans: ICode) => irrelevans.code)
      const isIdPresent: boolean = hentIder.includes(relevans.value)

      return !isIdPresent
    })

    return (
      <div>
        {ingenEgenskaper && (
          <BodyShort size="small">
            For å filtrere bort krav som ikke er relevante, må dere oppgi egenskaper ved
            dokumentasjonen.
          </BodyShort>
        )}

        {irrelevans && (
          <div className="flex flex-wrap gap-2">
            {relevans.map((relevans, index) => (
              <div key={relevans.value} className="flex items-center gap-1">
                <Tag variant={fargeForFemAlternativ[index]} size="small">
                  <BodyShort size="small">{relevans.label}</BodyShort>
                </Tag>
              </div>
            ))}
          </div>
        )}

        {!irrelevans && (
          <div className="flex flex-wrap gap-2">
            {relevansCodeList.map((relevans, index) => (
              <div key={relevans.value} className="flex items-center gap-1">
                <Tag variant={fargeForFemAlternativ[index]} size="small">
                  <BodyShort size="small">{relevans.label}</BodyShort>
                </Tag>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <ExpansionCard aria-label="tittel på etterlevelsesdokument" className="w-full">
        <ExpansionCard.Header className="border-b border-solid border-gray-500">
          <ExpansionCard.Title as="h4" size="small">
            E{etterlevelseNummer.toString()} {title}
          </ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content>
          {behandlerPersonopplysninger && (
            <BehandlingList
              behandlingIds={behandlingIds}
              behandlerPersonopplysninger={behandlerPersonopplysninger}
              behandlinger={behandlinger}
            />
          )}
          <div className="mb-2.5">
            {etterlevelseDokumentasjon.avdeling && (
              <div className="flex items-start gap-2">
                <BodyShort size="small">Avdeling:</BodyShort>
                <BodyShort size="small">{etterlevelseDokumentasjon.avdeling.shortName}</BodyShort>
              </div>
            )}
            {!etterlevelseDokumentasjon.avdeling && (
              <BodyShort size="small">Avdeling er ikke angitt</BodyShort>
            )}
          </div>
          <div className="mb-2.5">
            {teams.length > 0 && <Teams teams={teams} link />}
            {teams.length === 0 && <BodyShort size="small">Team er ikke angitt</BodyShort>}
          </div>
          <div className="flex items-start gap-2">
            <BodyShort size="small">Egenskaper:</BodyShort>
            {irrelevansFor.length === relevansCodeList.length && (
              <div className="flex items-center gap-1">
                <ExclamationmarkTriangleFillIcon
                  area-label=""
                  aria-hidden
                  className="text-2xl text-icon-warning"
                />
                <Label size="small">Ingen egenskaper er oppgitt</Label>
              </div>
            )}
            {getRelevans(irrelevansFor)}
          </div>
        </ExpansionCard.Content>
      </ExpansionCard>
    </>
  )
}
