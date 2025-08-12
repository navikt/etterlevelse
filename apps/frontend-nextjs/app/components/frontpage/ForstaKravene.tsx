import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'
import { ampli } from '@/services/amplitude/amplitudeService'
import { LinkPanel } from '@navikt/ds-react'

export const ForstaKravene = () => (
  <div className='w-full mr-2.5'>
    <LinkPanel
      href={temaUrl}
      onClick={() => {
        const ampliInstance = ampli()
        if (ampliInstance) {
          ampliInstance.logEvent('navigere', {
            kilde: 'forside-panel',
            app: 'etterlevelse',
            til: temaUrl,
            fra: '/',
          })
        }
      }}
    >
      <LinkPanel.Title>Forstå kravene</LinkPanel.Title>
      <LinkPanel.Description>
        Få oversikt over krav til etterlevelse, og bli trygg på at du kjenner til alle relevante
        krav for det du lager
      </LinkPanel.Description>
    </LinkPanel>
  </div>
)
export default ForstaKravene
