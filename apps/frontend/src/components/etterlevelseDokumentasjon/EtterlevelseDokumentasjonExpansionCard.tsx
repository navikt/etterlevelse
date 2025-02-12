import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Heading, Label, Link, ReadMore, Tag } from '@navikt/ds-react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { TEtterlevelseDokumentasjonQL } from '../../constants'
import { CodelistService, EListName, ICode, IGetParsedOptionsProps } from '../../services/Codelist'
import { user } from '../../services/User'
import { BehandlingList } from '../behandling/BehandlingList'
import { Markdown } from '../common/Markdown'
import { ExternalLink } from '../common/RouteLink'
import { Teams } from '../common/TeamName'
import { VarslingsadresserView } from './VarslingsAddresseView'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  relasjonLoading?: boolean
}

export const EtterlevelseDokumentasjonExpansionCard = (props: IProps) => {
  const { etterlevelseDokumentasjon, relasjonLoading } = props
  const navigate: NavigateFunction = useNavigate()
  const [codelistUtils] = CodelistService()

  const relevansCodeList: IGetParsedOptionsProps[] = codelistUtils.getParsedOptions(
    EListName.RELEVANS
  )

  const { behandlerPersonopplysninger, behandlingIds, behandlinger, teams, irrelevansFor } =
    etterlevelseDokumentasjon

  const getRelevans = (irrelevans: ICode[]) => {
    const fargeForFemAlternativ = ['alt1', 'alt2', 'alt3', 'alt1', 'alt2'] as const
    const ingenEgenskaper: boolean = irrelevans.length === relevansCodeList.length

    const relevans: IGetParsedOptionsProps[] = relevansCodeList.filter(
      (relevans: IGetParsedOptionsProps) => {
        const hentIder: string[] = irrelevans.map((irrelevans: ICode) => irrelevans.code)
        const isIdPresent: boolean = hentIder.includes(relevans.value)

        return !isIdPresent
      }
    )

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
            {relevans.map((relevans: IGetParsedOptionsProps, index: number) => (
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
            {relevansCodeList.map((relevans: IGetParsedOptionsProps, index: number) => (
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
      <div>
        <div>
          <ReadMore
            header="Les mer om dette dokumentet"
            aria-label="Les mer om dette dokumentet"
            className="w-full"
          >
            <div>
              {etterlevelseDokumentasjon.beskrivelse && (
                <div className="mb-3">
                  <Heading className="mb-3" level="2" size="small">
                    Dokumentbeskrivelse
                  </Heading>
                  <Markdown source={etterlevelseDokumentasjon.beskrivelse} />
                </div>
              )}
              <div className="max-w-[75ch]">
                {behandlerPersonopplysninger && (
                  <BehandlingList
                    behandlingIds={behandlingIds}
                    behandlerPersonopplysninger={behandlerPersonopplysninger}
                    behandlinger={behandlinger}
                  />
                )}

                <div className="flex items-start gap-2 mb-2.5">
                  <Label size="small">Egenskaper:</Label>
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

                <div className="flex items-start gap-2 mb-2.5">
                  <Label size="small">ROS-dokumentasjon:</Label>
                  <BodyShort size="small">
                    {etterlevelseDokumentasjon.risikovurderinger.length !== 0 &&
                      etterlevelseDokumentasjon.risikovurderinger.map((vurdering) => {
                        const rosReg = /\[(.+)]\((.+)\)/i
                        const rosParts = vurdering.match(rosReg)
                        if (rosParts)
                          return (
                            <ExternalLink key={vurdering} className="flex" href={rosParts[2]}>
                              {rosParts[1]}
                            </ExternalLink>
                          )
                        return (
                          <span className="flex" key={vurdering}>
                            {vurdering}
                          </span>
                        )
                      })}

                    {etterlevelseDokumentasjon.risikovurderinger.length === 0 && 'Ikke angitt'}
                  </BodyShort>
                </div>

                <div className="mb-2.5">
                  <div className="flex items-start gap-2">
                    <Label size="small">Avdeling:</Label>
                    <BodyShort size="small">
                      {etterlevelseDokumentasjon.avdeling &&
                        etterlevelseDokumentasjon.avdeling.shortName}
                      {!etterlevelseDokumentasjon.avdeling && 'Ikke angitt'}
                    </BodyShort>
                  </div>
                </div>
                <div className="mb-2.5">
                  {teams.length > 0 && <Teams teams={teams} link />}
                  {teams.length === 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <Label size="small">Team:</Label>
                      <BodyShort>Ikke angitt</BodyShort>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <Label size="small" className="mt-2.5">
                    Varslingsadresser:
                  </Label>
                  <div>
                    {etterlevelseDokumentasjon.varslingsadresser && (
                      <VarslingsadresserView
                        varslingsadresser={etterlevelseDokumentasjon.varslingsadresser}
                      />
                    )}
                  </div>
                </div>
              </div>

              {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
                <div className="py-8">
                  <Button
                    onClick={() => {
                      navigate('/dokumentasjon/edit/' + etterlevelseDokumentasjon.id)
                    }}
                    size="small"
                    variant="secondary"
                    className="whitespace-nowrap"
                  >
                    Redigér dokumentegenskaper
                  </Button>
                </div>
              )}
            </div>
          </ReadMore>
        </div>

        {!relasjonLoading && etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
          <div className="mt-5">
            <ReadMore header="Dette må du vite om gjenbruk">
              {etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
                <Markdown source={etterlevelseDokumentasjon.gjenbrukBeskrivelse} />
              )}

              {etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
                <>
                  <div className="mt-5">
                    <Button
                      onClick={() => {
                        navigate('/dokumentasjon/gjenbruk/' + etterlevelseDokumentasjon.id)
                      }}
                      size="small"
                      variant="secondary"
                      className="whitespace-nowrap mt-3"
                      type="button"
                    >
                      Gjenbruk dokumentet
                    </Button>
                  </div>
                  <div className="mt-5">
                    <Link href={`/dokumentasjon/relasjon/${etterlevelseDokumentasjon.id}`}>
                      Se hvilke etterlevelser som allerede gjenbruker dette dokumentet
                    </Link>
                  </div>
                </>
              )}
            </ReadMore>
          </div>
        )}
      </div>
    </>
  )
}
