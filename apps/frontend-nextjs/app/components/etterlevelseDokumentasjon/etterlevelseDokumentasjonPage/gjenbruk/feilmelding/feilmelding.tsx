import { EEtterlevelseDokumentSchemaMelding } from '@/components/etterlevelseDokumentasjon/form/etterlevelseDokumentasjonSchema'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'
import { InfoCard, Link, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  values: TEtterlevelseDokumentasjonQL
}

const etterlevelseDokumentasjonUrl = (
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL,
  type: string
): string => {
  return `/dokumentasjon/edit/${etterlevelseDokumentasjon.id}#${type}`
}

export const GjenbrukFeilmelding: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  values,
}) => (
  <>
    {(values.title ||
      values.beskrivelse ||
      values.varslingsadresser ||
      values.teamsData ||
      values.resourcesData ||
      values.nomAvdelingId) && (
      <InfoCard data-color='warning'>
        <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
          <InfoCard.Title>
            Dere må oppdatere følgende felt i dokumentegenskaper før dere kan slå på gjenbruk.
          </InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>
          <List>
            {[null, undefined, ''].includes(values.title) && (
              <List.Item>
                <Link
                  href={etterlevelseDokumentasjonUrl(etterlevelseDokumentasjon, 'title')}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {EEtterlevelseDokumentSchemaMelding.TITLE} (åpner i en ny fane)
                </Link>
              </List.Item>
            )}
            {[null, undefined, ''].includes(values.beskrivelse) && (
              <List.Item>
                <Link
                  href={`/dokumentasjon/edit/${etterlevelseDokumentasjon.id}#beskrivelse`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {EEtterlevelseDokumentSchemaMelding.BESKRIVELSE} (åpner i en ny fane)
                </Link>
              </List.Item>
            )}
            {[null, undefined, ''].includes(values.varslingsadresser) && (
              <List.Item>
                <Link
                  href={etterlevelseDokumentasjonUrl(
                    etterlevelseDokumentasjon,
                    'varslingsadresser'
                  )}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {EEtterlevelseDokumentSchemaMelding.VARSLINGSADRESSER} (åpner i en ny fane)
                </Link>
              </List.Item>
            )}
            {[null, undefined, ''].includes(values.teamsData) && (
              <List.Item>
                <Link
                  href={etterlevelseDokumentasjonUrl(etterlevelseDokumentasjon, 'teamsData')}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {EEtterlevelseDokumentSchemaMelding.TEAMDATA} (åpner i en ny fane)
                </Link>
              </List.Item>
            )}
            {[null, undefined, ''].includes(values.resourcesData) && (
              <List.Item>
                <Link
                  href={etterlevelseDokumentasjonUrl(etterlevelseDokumentasjon, 'resourcesData')}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {EEtterlevelseDokumentSchemaMelding.RESOURCEDATA} (åpner i en ny fane)
                </Link>
              </List.Item>
            )}
            {[null, undefined, ''].includes(values.nomAvdelingId) && (
              <List.Item>
                <Link
                  href={etterlevelseDokumentasjonUrl(etterlevelseDokumentasjon, 'nomAvdelingId')}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {EEtterlevelseDokumentSchemaMelding.NOM_AVDELING_ID} (åpner i en ny fane)
                </Link>
              </List.Item>
            )}
          </List>
        </InfoCard.Content>
      </InfoCard>
    )}
  </>
)
