'use client'

import { useTilbakemeldinger } from '@/api/krav/tilbakemelding/tilbakemeldingApi'
import { IKrav, IKravVersjon } from '@/constants/krav/kravConstants'
import { useQueryParam } from '@/util/hooks/customHooks/customHooks'
import { Loader } from '@navikt/ds-react'
import { FunctionComponent, Suspense, useState } from 'react'
import { KravTilbakemeldingKravValid } from './kravTilbakemeldingKravValid/kravTilbakemeldingKravValid'
import { KravTilbakemeldingLoaded } from './kravTilbakemeldingLoaded/kravTilbakemeldingLoaded'

type TProps = {
  krav: IKrav
  alleKravVersjoner: IKravVersjon[]
}

const KravTilbakemeldingerContent: FunctionComponent<TProps> = ({ krav, alleKravVersjoner }) => {
  const [tilbakemeldinger, loading, add, replace, remove] = useTilbakemeldinger(
    krav.kravNummer,
    krav.kravVersjon
  )
  const [focusNr, setFocusNr] = useState<string | undefined>(useQueryParam('tilbakemeldingId'))

  return (
    <div className='w-full py-5'>
      {loading && <Loader size='large' />}

      {!loading && (
        <KravTilbakemeldingLoaded
          krav={krav}
          loading={loading}
          focusNr={focusNr}
          replace={replace}
          remove={remove}
          setFocusNr={setFocusNr}
          tilbakemeldinger={tilbakemeldinger}
        />
      )}

      <KravTilbakemeldingKravValid krav={krav} alleKravVersjoner={alleKravVersjoner} add={add} />
    </div>
  )
}

export const KravTilbakemeldinger: FunctionComponent<TProps> = (props) => (
  <Suspense fallback={<Loader size='large' />}>
    <KravTilbakemeldingerContent {...props} />
  </Suspense>
)
