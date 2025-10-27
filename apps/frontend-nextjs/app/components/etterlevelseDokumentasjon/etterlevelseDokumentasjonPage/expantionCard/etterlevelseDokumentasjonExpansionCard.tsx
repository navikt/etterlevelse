'use client'

import { BehandlingList } from '@/components/behandlingskatalog/behandlingList'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { Markdown } from '@/components/common/markdown/markdown'
import { Teams } from '@/components/teamkatalog/teams'
import { VarslingsadresserView } from '@/components/varslingsadresse/varslingsAddresseView'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { EListName, ICode } from '@/constants/kodeverk/kodeverkConstants'
import { CodelistContext, IGetParsedOptionsProps } from '@/provider/kodeverk/kodeverkProvider'
import { UserContext } from '@/provider/user/userProvider'
import {
  etterlevelseDokumentasjonGjenbrukIdUrl,
  etterlevelseDokumentasjonRelasjonUrl,
  etterlevelsesDokumentasjonEditUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { p360Url } from '@/routes/p360/p360Routes'
import { ettlevColors } from '@/util/theme/theme'
import { InformationSquareFillIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Button, Heading, Label, Link, ReadMore, Tag } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import { FunctionComponent, useContext } from 'react'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  relasjonLoading?: boolean
}

export const EtterlevelseDokumentasjonExpansionCard: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  relasjonLoading,
}) => {
  const router = useRouter()
  const codelist = useContext(CodelistContext)
  const user = useContext(UserContext)

  const relevansCodeList: IGetParsedOptionsProps[] = codelist.utils.getParsedOptions(
    EListName.RELEVANS
  )

  const { behandlingIds, behandlinger, teams, irrelevansFor } = etterlevelseDokumentasjon

  return (
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

                <RelevansView
                  relevansCodeList={relevansCodeList}
                  irrelevans={irrelevansFor}
                  etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                />
              </div>

              <div className='flex items-start gap-2 mb-2.5'>
                <div>
                  <Label size='medium'>Dokumentasjon:</Label>
                </div>
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
                <div>
                  <Label size='medium'>Saksnummer i Public 360:</Label>
                </div>
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
                <div>
                  <Label size='medium'>Avdeling:</Label>
                </div>
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

              <div className='mb-2.5'>
                {etterlevelseDokumentasjon.resourcesData &&
                  etterlevelseDokumentasjon.resourcesData.length > 0 && (
                    <div className='flex gap-2 items-start'>
                      <Label size='medium'>Personer:</Label>
                      <div className='flex flex-wrap tri'>
                        {etterlevelseDokumentasjon.resourcesData.map((resource, index, array) => (
                          <BodyShort className='mr-2' key={resource.fullName}>
                            {resource.fullName}
                            {index < array.length - 1 && ','}
                          </BodyShort>
                        ))}
                      </div>
                    </div>
                  )}

                {etterlevelseDokumentasjon.resourcesData &&
                  etterlevelseDokumentasjon.resourcesData.length === 0 && (
                    <div className='flex flex-wrap gap-2 items-center'>
                      <Label size='medium'>Personer:</Label>
                      <BodyLong size='medium'>Ikke angitt</BodyLong>
                    </div>
                  )}
              </div>

              <div className='flex items-start gap-2'>
                <div>
                  <Label size='medium'>Varslingsadresser:</Label>
                </div>
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
              Trenger du tilgang til å redigere dette dokumentet? I så fall ta kontakt med de som er
              nevnt under Team, Personer eller Varslingsadresser.
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
                      router.push(
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
  )
}

type TRelevansProps = {
  relevansCodeList: IGetParsedOptionsProps[]
  irrelevans: ICode[]
  etterlevelseDokumentasjonId?: string
}

const RelevansView: FunctionComponent<TRelevansProps> = ({
  relevansCodeList,
  irrelevans,
  etterlevelseDokumentasjonId,
}) => {
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
        <div className='flex gap-1'>
          <div>
            <InformationSquareFillIcon
              area-label=''
              aria-hidden
              className='text-2xl text-icon-warning mt-1'
              color={ettlevColors.green400}
              //color='#236b7d'
            />
          </div>
          <BodyLong size='medium' className='mt-0.75'>
            Dere har ikke valgt hvilke egenskaper som gjelder for behandlingen. Hvis dere ønsker å
            filtrere bort uaktuelle egenskaper og dermed redusere dokumentasjonsmengden, kan dette
            gjøres på{' '}
            <Link inlineText href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjonId)}>
              Redigér dokumentegenskaper
            </Link>
          </BodyLong>
        </div>
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

export default EtterlevelseDokumentasjonExpansionCard
