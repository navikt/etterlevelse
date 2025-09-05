import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, Heading, Label, Link, ReadMore, Tag } from '@navikt/ds-react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { TEtterlevelseDokumentasjonQL } from '../../constants'
import { CodelistService, EListName, ICode, IGetParsedOptionsProps } from '../../services/Codelist'
import { user } from '../../services/User'
import { BehandlingList } from '../behandling/BehandlingList'
import { Markdown } from '../common/Markdown'
import { ExternalLink } from '../common/RouteLink'
import {
  etterlevelseDokumentasjonGjenbrukIdUrl,
  etterlevelseDokumentasjonRelasjonUrl,
} from '../common/RouteLinkEtterlevelsesdokumentasjon'
import { Teams } from '../common/TeamName'
import { p360Url } from '../p360/LinkUrlUtils'
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

  const { behandlingIds, behandlinger, teams, irrelevansFor } = etterlevelseDokumentasjon

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
          <BodyLong size='medium'>
            For å filtrere bort krav som ikke er relevante, må dere oppgi egenskaper ved
            dokumentasjonen.
          </BodyLong>
        )}

        {irrelevans && (
          <div className='flex flex-wrap gap-2'>
            {relevans.map((relevans: IGetParsedOptionsProps, index: number) => (
              <div key={relevans.value} className='flex items-center gap-1'>
                <Tag variant={fargeForFemAlternativ[index]} size='medium'>
                  <BodyLong size='medium'>{relevans.label}</BodyLong>
                </Tag>
              </div>
            ))}
          </div>
        )}

        {!irrelevans && (
          <div className='flex flex-wrap gap-2'>
            {relevansCodeList.map((relevans: IGetParsedOptionsProps, index: number) => (
              <div key={relevans.value} className='flex items-center gap-1'>
                <Tag variant={fargeForFemAlternativ[index]} size='medium'>
                  <BodyLong size='medium'>{relevans.label}</BodyLong>
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
            header='Les mer om dette dokumentet'
            aria-label='Les mer om dette dokumentet'
            className='w-full'
          >
            <div>
              {etterlevelseDokumentasjon.beskrivelse && (
                <div className='mb-5'>
                  <Heading className='mb-3' level='2' size='small'>
                    Dokumentbeskrivelse
                  </Heading>
                  <Markdown source={etterlevelseDokumentasjon.beskrivelse} />
                </div>
              )}

              <Heading className='mb-3' level='2' size='small'>
                Dokumentegenskaper
              </Heading>

              <div className='max-w-[75ch]'>
                <BehandlingList behandlingIds={behandlingIds} behandlinger={behandlinger} />

                <div className='flex items-start gap-2 mb-2.5'>
                  <div className='mt-0.75'>
                    <Label size='medium'>Egenskaper:</Label>
                  </div>

                  {irrelevansFor.length === relevansCodeList.length && (
                    <div className='flex items-center gap-1'>
                      <ExclamationmarkTriangleFillIcon
                        area-label=''
                        aria-hidden
                        className='text-2xl text-icon-warning'
                      />
                      <Label size='medium'>Ingen egenskaper er oppgitt</Label>
                    </div>
                  )}
                  {getRelevans(irrelevansFor)}
                </div>

                <div className='flex items-start gap-2 mb-2.5'>
                  <Label size='medium'>Dokumentasjon:</Label>
                  <BodyLong size='medium'>
                    {etterlevelseDokumentasjon.risikovurderinger.length !== 0 &&
                      etterlevelseDokumentasjon.risikovurderinger.map((vurdering) => {
                        const rosReg = /\[(.+)]\((.+)\)/i
                        const rosParts = vurdering.match(rosReg)
                        if (rosParts)
                          return (
                            <ExternalLink key={vurdering} className='flex' href={rosParts[2]}>
                              {rosParts[1]}
                            </ExternalLink>
                          )
                        return (
                          <span className='flex' key={vurdering}>
                            {vurdering}
                          </span>
                        )
                      })}

                    {etterlevelseDokumentasjon.risikovurderinger.length === 0 && 'Ikke angitt'}
                  </BodyLong>
                </div>

                <div className='flex items-start gap-2 mb-2.5'>
                  <Label size='medium'>Saksnummer i Public 360:</Label>
                  {etterlevelseDokumentasjon.p360CaseNumber !== '' && (
                    <Link
                      href={p360Url(etterlevelseDokumentasjon.p360Recno)}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {etterlevelseDokumentasjon.p360CaseNumber} (åpner i en ny fane)
                    </Link>
                  )}

                  {etterlevelseDokumentasjon.p360CaseNumber === '' && (
                    <BodyLong>Ingen saksnummer</BodyLong>
                  )}
                </div>

                <div className='flex items-start gap-2 mb-2.5'>
                  <Label size='medium'>Avdeling:</Label>
                  <BodyLong size='medium'>
                    {etterlevelseDokumentasjon.nomAvdelingId &&
                      etterlevelseDokumentasjon.avdelingNavn}
                    {!etterlevelseDokumentasjon.nomAvdelingId && 'Ikke angitt'}
                  </BodyLong>
                </div>

                <div className='mb-2.5'>
                  {teams.length > 0 && <Teams teams={teams} link />}
                  {teams.length === 0 && (
                    <div className='flex flex-wrap gap-2 items-center'>
                      <Label size='medium'>Team:</Label>
                      <BodyLong size='medium'>Ikke angitt</BodyLong>
                    </div>
                  )}
                </div>

                <div className='flex items-start gap-2'>
                  <Label size='medium'>Varslingsadresser:</Label>
                  <div>
                    {etterlevelseDokumentasjon.varslingsadresser && (
                      <VarslingsadresserView
                        varslingsadresser={etterlevelseDokumentasjon.varslingsadresser}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            {!(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
              <BodyLong>
                Trenger du tilgang til å redigere dette dokumentet? I så fall ta kontakt med de som
                er nevnt under Team eller Varslingsadresser.
              </BodyLong>
            )}
          </ReadMore>
        </div>

        {!relasjonLoading && etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
          <div className='mt-5'>
            <ReadMore header='Dette må du vite om gjenbruk'>
              {etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
                <Markdown source={etterlevelseDokumentasjon.gjenbrukBeskrivelse} />
              )}

              {etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
                <>
                  <div className='mt-5'>
                    <Button
                      onClick={() => {
                        navigate(
                          etterlevelseDokumentasjonGjenbrukIdUrl(etterlevelseDokumentasjon.id)
                        )
                      }}
                      size='small'
                      variant='secondary'
                      className='whitespace-nowrap mt-3'
                      type='button'
                    >
                      Gjenbruk dokumentet
                    </Button>
                  </div>
                  <div className='mt-5'>
                    <Link href={etterlevelseDokumentasjonRelasjonUrl(etterlevelseDokumentasjon.id)}>
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
