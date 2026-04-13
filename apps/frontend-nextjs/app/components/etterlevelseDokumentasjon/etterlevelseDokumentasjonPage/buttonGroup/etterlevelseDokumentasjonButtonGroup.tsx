'use client'

import { getPvoTilbakemeldingByPvkDokumentId } from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IDocumentRelationWithEtterlevelseDokumetajson } from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { env } from '@/util/env/env'
import { Loader } from '@navikt/ds-react'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import TillatGjenbrukModal from '../gjenbruk/TillatGjenbrukModal'
import { EtterlevelseButton } from './etterlevelseButton/etterlevelseButton'
import GjenbrukButton from './gjenbrukButton/gjenbrukButton'
import { PersonvernkonsekvensvurderingButton } from './personvernkonsekvensvurderingButton/personvernkonsekvensvurderingButton'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
  relasjonLoading: boolean
  morDokumentRelasjon?: IDocumentRelationWithEtterlevelseDokumetajson
  behandlingsLivslop?: IBehandlingensLivslop
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  pvkDokument?: IPvkDokument
}

export const EtterlevelseDokumentasjonButtonGroup: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  relasjonLoading,
  morDokumentRelasjon,
  behandlingsLivslop,
  behandlingensArtOgOmfang,
  pvkDokument,
}) => {
  const user = useContext(UserContext)
  const [pvoTilbakemelding, setPvoTilbakemelding] = useState<IPvoTilbakemelding>()
  const behandlerPersonopplysninger: boolean = !etterlevelseDokumentasjon.irrelevansFor.some(
    (irrelevans) =>
      irrelevans.code === 'PERSONOPPLYSNINGER' ||
      irrelevans.shortName === 'Behandler personopplysninger'
  )

  useEffect(() => {
    ;(async () => {
      if (pvkDokument) {
        await getPvoTilbakemeldingByPvkDokumentId(pvkDokument.id)
          .then((resp) => {
            if (resp) {
              setPvoTilbakemelding(resp)
            }
          })
          .catch(() => null)
      }
    })()
  }, [pvkDokument])

  return (
    <>
      <>
        {/* {(user.isAdmin() || etterlevelseDokumentasjon.hasCurrentUserAccess) && (
          <Button
            onClick={() => {
              router.push(etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id))
            }}
            size='small'
            variant='tertiary'
            className='whitespace-nowrap w-full justify-center'
          >
            Rediger dokumentegenskaper
          </Button>
        )} */}
        {etterlevelseDokumentasjon.forGjenbruk &&
          etterlevelseDokumentasjon.hasCurrentUserAccess && (
            <TillatGjenbrukModal
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
            />
          )}

        {/* {behandlerPersonopplysninger && (
          <Button
            onClick={() => {
              router.push(
                pvkDokumentasjonBehandlingsenLivslopUrl(
                  etterlevelseDokumentasjon.id,
                  behandlingsLivslop ? behandlingsLivslop.id : 'ny'
                )
              )
            }}
            size='small'
            variant={getVariantForBLLButton(behandlingsLivslop)}
            className='whitespace-nowrap'
          >
            Tegn behandlingens livsløp
          </Button>
        )}

         {behandlerPersonopplysninger && (
          <Button
            onClick={() => {
              router.push(
                pvkDokumentasjonBehandlingsenArtOgOmfangUrl(
                  etterlevelseDokumentasjon.id,
                  artOgOmfang.id ? artOgOmfang.id : 'ny'
                )
              )
            }}
            size='small'
            variant={getVariantForBAOButton(artOgOmfang)}
            className='whitespace-nowrap'
          >
            Beskriv art og omfang
          </Button>
        )}

        {behandlerPersonopplysninger &&
          pvkDokument &&
          pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE && (
            <Button
              onClick={() => {
                router.push(
                  pvkDokumentasjonStepUrl(etterlevelseDokumentasjon.id, pvkDokument.id, 1)
                )
              }}
              size='small'
              variant={getVariantForPVKButton(pvkDokument, behandlingsLivslop)}
              className='whitespace-nowrap'
            >
              {getPvkButtonText(pvkDokument, risikoscenarioList, isRisikoeier)}
            </Button>
          )}

        {behandlerPersonopplysninger && (
          <Button
            onClick={() => {
              router.push(
                pvkDokumentasjonPvkBehovUrl(
                  etterlevelseDokumentasjon.id,
                  pvkDokument ? pvkDokument.id : 'ny'
                )
              )
            }}
            size='small'
            variant={getVariantForPVKBehovButton(pvkDokument, behandlingsLivslop)}
            className='whitespace-nowrap'
          >
            {isPvkDokumentVurdert(pvkDokument) ? 'Revurder behov for PVK' : 'Vurder behov for PVK'}
          </Button>
        )} */}
      </>

      <EtterlevelseButton etterlevelseDokumentasjon={etterlevelseDokumentasjon} user={user} />

      {behandlerPersonopplysninger && (
        <PersonvernkonsekvensvurderingButton
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
          pvoTilbakemelding={pvoTilbakemelding}
          user={user}
        />
      )}

      {env.isDev &&
        (user.isAdmin() || etterlevelseDokumentasjon.hasCurrentUserAccess) &&
        relasjonLoading && <Loader />}

      {/** KUN synlig i dev da den ikke er klar til å bli prodsatt ennå  */}
      {env.isDev &&
        (user.isAdmin() || etterlevelseDokumentasjon.hasCurrentUserAccess) &&
        !relasjonLoading &&
        !morDokumentRelasjon && (
          <GjenbrukButton
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
            user={user}
          />
        )}
    </>
  )
}

export default EtterlevelseDokumentasjonButtonGroup
