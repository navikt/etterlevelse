import {
  EEtterlevelseDokumentSchemaMelding,
  EPaKrevdMember,
} from '@/components/etterlevelseDokumentasjon/form/etterlevelseDokumentasjonSchema'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { isEmptyArray, isMissingText } from '@/util/common/validationUtils'
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
  const missingTitle = isMissingText(values.title)
  const missingBeskrivelse = isMissingText(values.beskrivelse)
  const missingVarslingsadresser = isEmptyArray(values.varslingsadresser)
  const missingTeamsData = isEmptyArray(values.teamsData)
  const missingResourcesData = isEmptyArray(values.resourcesData)
  const missingNomAvdelingId = isMissingText(values.nomAvdelingId)

  const hasMissingRequiredField =
    missingTitle ||
    missingBeskrivelse ||
    missingVarslingsadresser ||
    (missingTeamsData && missingResourcesData) ||
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
              {missingTeamsData && missingResourcesData && (
                <List.Item>
                  <Link
                    href={etterlevelseDokumentasjonUrl(etterlevelseDokumentasjon, 'teamsData')}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {EPaKrevdMember.PAKREVD} (åpner i en ny fane)
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
