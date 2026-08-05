'use client'

import { getBehandlingensArtOgOmfangByEtterlevelseDokumentId } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import { getBehandlingensLivslopByEtterlevelseDokumentId } from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  pvkDokumentasjonBehandlingsenArtOgOmfangUrl,
  pvkDokumentasjonBehandlingsenLivslopUrl,
  pvkDokumentasjonPvkBehovUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { List, LocalAlert } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'

type TProps = {
  etterlevelseDokumentasjonId: string
}

export const PvkBehovVarsel: FunctionComponent<TProps> = ({ etterlevelseDokumentasjonId }) => {
  const [artOgOmfang, setArtOgOmfang] = useState<IBehandlingensArtOgOmfang>()
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [behandlingsLivslop, setBehandlingsLivslop] = useState<IBehandlingensLivslop>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      await getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjonId)
        .then((response: IPvkDokument) => setPvkDokument(response))
        .catch((error) => console.debug(error))
      await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjonId)
        .then((response: IBehandlingensLivslop) => setBehandlingsLivslop(response))
        .catch((error) => console.debug(error))
      await getBehandlingensArtOgOmfangByEtterlevelseDokumentId(etterlevelseDokumentasjonId)
        .then((response: IBehandlingensArtOgOmfang) => setArtOgOmfang(response))
        .catch((error) => console.debug(error))
      setIsLoading(false)
    })()
  }, [etterlevelseDokumentasjonId])

  if (isLoading) return null

  if (pvkDokument?.pvkVurdering && pvkDokument.pvkVurdering !== EPvkVurdering.UNDEFINED) return null

  return (
    <LocalAlert status='warning' size='small'>
      <LocalAlert.Header>
        <LocalAlert.Title>
          Fordi dere behandler personopplysninger, må dere vurdere behov for å gjennomføre
          personvernkonsekvensvurdering (PVK)
        </LocalAlert.Title>
      </LocalAlert.Header>
      <LocalAlert.Content>
        <List as='ul'>
          <List.Item>
            <ExternalLink
              href={pvkDokumentasjonBehandlingsenLivslopUrl(
                etterlevelseDokumentasjonId,
                behandlingsLivslop?.id ?? 'ny'
              )}
            >
              Vurder behandlingens livsløp
            </ExternalLink>
          </List.Item>
          <List.Item>
            <ExternalLink
              href={pvkDokumentasjonBehandlingsenArtOgOmfangUrl(
                etterlevelseDokumentasjonId,
                artOgOmfang?.id ?? 'ny'
              )}
            >
              Vurder behandlingens art og omfang
            </ExternalLink>
          </List.Item>
          <List.Item>
            <ExternalLink
              href={pvkDokumentasjonPvkBehovUrl(
                etterlevelseDokumentasjonId,
                pvkDokument?.id ?? 'ny'
              )}
            >
              Registrer om dere skal gjøre PVK
            </ExternalLink>
          </List.Item>
        </List>
      </LocalAlert.Content>
    </LocalAlert>
  )
}
