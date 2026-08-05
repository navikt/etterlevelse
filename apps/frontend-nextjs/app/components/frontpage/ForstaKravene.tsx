'use client'

import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'
import { LinkPanel } from '@navikt/ds-react'

export const ForstaKravene = () => {
  return (
    <div className='w-full mr-2.5'>
      <LinkPanel
        href={temaUrl}
        onClick={() => {
          // const ampliInstance = ampli()
          // if (ampliInstance) {
          //   ampliInstance.logEvent('navigere', {
          //     kilde: 'forside-panel',
          //     app: 'etterlevelse',
          //     til: temaUrl,
          //     fra: '/',
          //   })
          // }
        }}
      >
        <LinkPanel.Title>Forstå kravene</LinkPanel.Title>
        <LinkPanel.Description>
          Hvilke krav må vi etterleve i Nav? Få oversikt over overordnede temaer og alle
          etterlevelseskrav.
        </LinkPanel.Description>
      </LinkPanel>
    </div>
  )
}
export default ForstaKravene
