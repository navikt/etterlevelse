import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyShort, ExpansionCard, Label, Tag } from '@navikt/ds-react'
import { TEtterlevelseDokumentasjonQL } from '../../constants'
import { EListName, ICode, codelist } from '../../services/Codelist'
import { env } from '../../util/env'
import { ExternalLink } from '../common/RouteLink'
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

  const getRelevans = (irrelevans?: ICode[]) => {
    const fargeForFemAlternativ = ['alt1', 'alt2', 'alt3', 'alt1', 'alt2'] as const

    if (irrelevans?.length === relevansCodeList.length) {
      return (
        <BodyShort size="small">
          For å filtrere bort krav som ikke er relevante, må dere oppgi egenskaper ved
          dokumentasjonen.
        </BodyShort>
      )
    }

    if (irrelevans) {
      const relevans = relevansCodeList.filter(
        (n) => !irrelevans.map((ir: ICode) => ir.code).includes(n.value)
      )

      return (
        <div className="flex flex-wrap gap-2">
          {relevans.map((r, index) => (
            <div key={r.value} className="flex items-center gap-1">
              <Tag variant={fargeForFemAlternativ[index]} size="small">
                <BodyShort size="small">{r.label}</BodyShort>
              </Tag>
            </div>
          ))}
        </div>
      )
    }
    return (
      <div className="flex flex-wrap gap-2">
        {relevansCodeList.map((o, index) => (
          <div key={o.value} className="flex items-center gap-1">
            <Tag variant={fargeForFemAlternativ[index]} size="small">
              <BodyShort size="small">{o.label}</BodyShort>
            </Tag>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ExpansionCard aria-label="tittel på etterlevelsesdokument" className="w-full">
      <ExpansionCard.Header className="border-b border-solid border-gray-500">
        <ExpansionCard.Title as="h4" size="small">
          E{etterlevelseNummer.toString()} {title}
        </ExpansionCard.Title>
      </ExpansionCard.Header>
      <ExpansionCard.Content>
        {behandlerPersonopplysninger && (
          <div className="flex gap-2 flex-wrap items-center mb-2.5">
            <BodyShort size="small">Behandling:</BodyShort>
            {behandlingIds?.length >= 1 && behandlerPersonopplysninger ? (
              behandlingIds.map((behandlingId, index) => (
                <div key={'behandling_link_' + index}>
                  {behandlinger && behandlinger[index].navn ? (
                    <ExternalLink
                      className="text-medium"
                      href={`${env.pollyBaseUrl}process/${behandlingId}`}
                    >
                      {behandlinger?.length > 0 ? `${behandlinger[index].navn}` : 'Ingen data'}
                    </ExternalLink>
                  ) : (
                    <BodyShort size="small">
                      {behandlinger ? behandlinger[index].navn : 'Ingen data'}
                    </BodyShort>
                  )}
                </div>
              ))
            ) : (
              <BodyShort size="small">
                Husk å legge til behandling fra behandlingskatalogen
              </BodyShort>
            )}
          </div>
        )}
        <div className="mb-2.5">
          {teams.length > 0 ? (
            <Teams teams={teams} link />
          ) : (
            <BodyShort size="small">Team er ikke angitt</BodyShort>
          )}
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
          {!irrelevansFor.length ? getRelevans() : getRelevans(irrelevansFor)}
        </div>
      </ExpansionCard.Content>
    </ExpansionCard>
  )
}
