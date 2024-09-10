import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Label, Link, ReadMore, Tag } from '@navikt/ds-react'
import { useNavigate } from 'react-router-dom'
import { TEtterlevelseDokumentasjonQL } from '../../constants'
import { EListName, ICode, codelist } from '../../services/Codelist'
import { user } from '../../services/User'
import { BehandlingList } from '../behandling/BehandlingList'
import { Markdown } from '../common/Markdown'
import { Teams } from '../common/TeamName'
import { VarslingsadresserView } from './VarslingsAddresseView'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  relasjonLoading?: boolean
}

export const EtterlevelseDokumentasjonExpansionCard = (props: IProps) => {
  const { etterlevelseDokumentasjon, relasjonLoading } = props
  const navigate = useNavigate()

  const relevansCodeList = codelist.getParsedOptions(EListName.RELEVANS)

  const { behandlerPersonopplysninger, behandlingIds, behandlinger, teams, irrelevansFor } =
    etterlevelseDokumentasjon

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
      <div>
        <div>
          <ReadMore
            header="Les mer om dokumentet"
            aria-label="tittel på etterlevelsesdokument"
            className="w-full"
          >
            <div>
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
                    <BodyShort size="small">
                      {etterlevelseDokumentasjon.avdeling.shortName}
                    </BodyShort>
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
              <div className="flex items-start gap-2">
                <BodyShort size="small" className="mt-[3px]">
                  Varslingsadresser:
                </BodyShort>
                <div>
                  {etterlevelseDokumentasjon.varslingsadresser && (
                    <VarslingsadresserView
                      varslingsadresser={etterlevelseDokumentasjon.varslingsadresser}
                    />
                  )}
                </div>
              </div>
            </div>
          </ReadMore>
        </div>
        {!relasjonLoading && etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
          <div className="mt-5">
            <ReadMore header="Dette må du vite om gjenbruk">
              {etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
                <Markdown source={etterlevelseDokumentasjon.gjenbrukBeskrivelse} />
              )}

              {etterlevelseDokumentasjon.tilgjengeligForGjenbruk && user.isAdmin() && (
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
