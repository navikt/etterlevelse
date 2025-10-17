'use client'

import { IPageResponse } from "@/constants/commonConstants"
import { TEtterlevelseQL, EEtterlevelseStatus } from "@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants"
import { TEtterlevelseDokumentasjonQL } from "@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants"
import { TKravQL } from "@/constants/krav/kravConstants"
import { behandlingName } from "@/util/behandling/behandlingUtil"
import { FormSummary, Link, List } from "@navikt/ds-react"
import { FunctionComponent, useState, useEffect } from "react"
import FormAlert from "./formAlert"
import { usePathname } from "next/navigation"

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  manglerBehandlingError: boolean
  pvkKravError: string
  pvkKrav:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
}

export const TilhorendeDokumentasjonSummary: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  manglerBehandlingError,
  pvkKravError,
  pvkKrav,
}) => {
  const pathName = usePathname()
  const [antallFerdigPvkKrav, setAntallFerdigPvkKrav] = useState<number>(0)

  useEffect(() => {
    const pvkEtterlevelser: TEtterlevelseQL[] = []

    pvkKrav?.krav.content.forEach((krav) => {
      pvkEtterlevelser.push(...krav.etterlevelser)
    })

    setAntallFerdigPvkKrav(
      pvkEtterlevelser.filter(
        (etterlevelse) => etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT
      ).length
    )
  }, [pvkKrav])

  return (
    <FormSummary className='my-3'>
      <FormSummary.Header>
        <FormSummary.Heading level='2' id='behandlingensLivslop'>
          Tilhørende dokumentasjon
        </FormSummary.Heading>
        <Link
          className='cursor-pointer'
          href={`${pathName}?steg=4`}
        >
          Les detaljer
        </Link>
      </FormSummary.Header>
      <FormSummary.Answers>
        <FormSummary.Answer>
          <FormSummary.Value>
            <FormSummary.Answers>
              <FormSummary.Answer>
                <FormSummary.Label>Behandlinger i Behandlingskatalogen</FormSummary.Label>
                <FormSummary.Value>
                  <List as='ul'>
                    {etterlevelseDokumentasjon.behandlinger?.length === 0 && (
                      <List.Item>Ingen behandlinger</List.Item>
                    )}

                    {etterlevelseDokumentasjon.behandlinger?.length !== 0 &&
                      etterlevelseDokumentasjon.behandlinger?.map((behandling) => (
                        <List.Item key={behandling.id}>{behandlingName(behandling)}</List.Item>
                      ))}

                    {manglerBehandlingError && (
                      <FormAlert>
                        Dere må legge inn minst 1 behandling fra Behandlingskatalogen
                      </FormAlert>
                    )}
                  </List>
                </FormSummary.Value>
              </FormSummary.Answer>

              <FormSummary.Answer>
                <FormSummary.Label>PVK-relaterte etterlevelseskrav</FormSummary.Label>
                <FormSummary.Value>
                  <List as='ul'>
                    <List.Item>
                      {antallFerdigPvkKrav} av {pvkKrav?.krav.totalElements} krav ferdigstilt
                    </List.Item>
                  </List>

                  {pvkKravError !== '' && (
                    <FormAlert>
                      Dere må ferdigstille dokumentasjon av alle PVK-relaterte etterlevelseskrav
                    </FormAlert>
                  )}
                </FormSummary.Value>
              </FormSummary.Answer>

              <FormSummary.Answer>
                <FormSummary.Label>Risiko- og sårbarhetsvurdering (ROS)</FormSummary.Label>
                <FormSummary.Value>
                  <List as='ul'>
                    {etterlevelseDokumentasjon.risikovurderinger?.length === 0 && (
                      <List.Item>Ingen vedlegg</List.Item>
                    )}

                    {etterlevelseDokumentasjon.risikovurderinger?.length !== 0 &&
                      etterlevelseDokumentasjon.risikovurderinger?.map((ros) => {
                        const rosReg: RegExp = /\[(.+)]\((.+)\)/i
                        const rosParts: RegExpMatchArray | null = ros.match(rosReg)
                        if (rosParts) return <List.Item key={ros}>{rosParts[1]}</List.Item>
                        return <List.Item key={ros}>{ros}</List.Item>
                      })}
                  </List>
                </FormSummary.Value>
              </FormSummary.Answer>
            </FormSummary.Answers>
          </FormSummary.Value>
        </FormSummary.Answer>
      </FormSummary.Answers>
    </FormSummary>
  )
}
export default TilhorendeDokumentasjonSummary