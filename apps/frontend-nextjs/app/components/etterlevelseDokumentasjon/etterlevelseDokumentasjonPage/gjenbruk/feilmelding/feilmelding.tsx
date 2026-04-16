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
}) => {
  const missingTitle = [null, undefined, ''].includes(values.title)
  const missingBeskrivelse = [null, undefined, ''].includes(values.beskrivelse)
  const missingVarslingsadresser =
    !values.varslingsadresser || values.varslingsadresser.length === 0
  const missingTeamsData = !values.teamsData || values.teamsData.length === 0
  const missingResourcesData = !values.resourcesData || values.resourcesData.length === 0
  const missingNomAvdelingId = [null, undefined, ''].includes(values.nomAvdelingId)

  const hasMissingRequiredField =
    missingTitle ||
    missingBeskrivelse ||
    missingVarslingsadresser ||
    missingTeamsData ||
    missingResourcesData ||
    missingNomAvdelingId

  return (
    <>
      {hasMissingRequiredField && (
        <InfoCard data-color='warning'>
          <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
            <InfoCard.Title>
              Dere må oppdatere følgende felt i dokumentegenskaper før dere kan slå på gjenbruk.
            </InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            <List>
              {missingTitle && (
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
              {missingBeskrivelse && (
                <List.Item>
                  <Link
                    href={etterlevelseDokumentasjonUrl(etterlevelseDokumentasjon, 'beskrivelse')}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {EEtterlevelseDokumentSchemaMelding.BESKRIVELSE} (åpner i en ny fane)
                  </Link>
                </List.Item>
              )}
              {missingVarslingsadresser && (
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
              {missingTeamsData && (
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
              {missingResourcesData && (
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
              {missingNomAvdelingId && (
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
}
