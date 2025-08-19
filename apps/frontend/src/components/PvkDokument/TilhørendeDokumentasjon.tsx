import { BodyLong, BodyShort, Heading, Link, List } from '@navikt/ds-react'
import { FunctionComponent, RefObject } from 'react'
import { behandlingName } from '../../api/BehandlingApi'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  TEtterlevelseDokumentasjonQL,
} from '../../constants'
import { getPollyBaseUrl } from '../behandling/utils/pollyUrlUtils'
import { ExternalLink } from '../common/RouteLink'
import { behandlingskatalogenProcessUrl } from '../common/RouteLinkBehandlingskatalogen'
import { etterlevelsesDokumentasjonEditUrl } from '../common/RouteLinkEtterlevelsesdokumentasjon'
import { ContentLayout } from '../layout/layout'
import { PvkSidePanelWrapper } from './common/PvkSidePanelWrapper'
import FormButtons from './edit/FormButtons'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
  pvoTilbakemelding?: IPvoTilbakemelding
}

export const TilhørendeDokumentasjon: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvoTilbakemelding,
}) => {
  return (
    <div className='w-full'>
      <ContentLayout>
        <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
          <div className='flex justify-center'>
            <div>
              <Heading level='1' size='medium' className='mb-5'>
                Tilhørende dokumentasjon
              </Heading>
              <BodyLong>
                Dere har koblet følgende behandlinger på denne etterlevelsesdokumentasjonen:
              </BodyLong>
              {etterlevelseDokumentasjon.behandlinger && (
                <List as='ul'>
                  {etterlevelseDokumentasjon.behandlinger.map((behandling) => (
                    <List.Item key={behandling.id}>
                      <ExternalLink
                        className='text-medium'
                        href={behandlingskatalogenProcessUrl(getPollyBaseUrl(), behandling.id)}
                      >
                        {behandlingName(behandling)}
                      </ExternalLink>
                    </List.Item>
                  ))}
                </List>
              )}
              {etterlevelseDokumentasjon.behandlinger?.length === 0 && (
                <BodyLong>Ingen behandlinger knyttet til denne dokumentasjonen.</BodyLong>
              )}

              <BodyShort className='inline-block mb-5'>
                Dere kan redigere hvilke behandlinger som gjelder i{' '}
                <Link
                  href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='redigere etterlevelsesdokumentasjon'
                >
                  Redigér dokumentegenskaper (åpner i en ny fane).
                </Link>
              </BodyShort>
            </div>
          </div>
        </div>

        {/* sidepanel */}
        {pvoTilbakemelding && pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
          <PvkSidePanelWrapper>test Tilhørende Dokumentasjon</PvkSidePanelWrapper>
        )}
      </ContentLayout>
      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
        submitForm={formRef.current?.submitForm}
      />
    </div>
  )
}

export default TilhørendeDokumentasjon
