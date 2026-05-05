'use client'

import { StepTitle } from '@/components/PVK/pvkDokumentPage/pvkDokumentReadOnlyPage'
import BodyLongWithLineBreak from '@/components/common/bodyLongWithLineBreak'
import {
  EPVK,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FormSummary, List } from '@navikt/ds-react'
import { usePathname } from 'next/navigation'
import { FunctionComponent } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  personkategorier: string[]
  databehandlere: string[]
  customStepNumber?: number
}

export const InvolveringSummaryReadOnly: FunctionComponent<TProps> = ({
  pvkDokument,
  personkategorier,
  databehandlere,
  customStepNumber,
}) => {
  const pathName = usePathname()
  const booleanToText = (value?: boolean) => {
    if (value === undefined || value === null) {
      return 'Ikke besvart'
    } else if (value) return 'Ja'
    else return 'Nei'
  }

  return (
    <FormSummary className='my-3'>
      <FormSummary.Header>
        <FormSummary.Heading level='2'>{StepTitle[4]}</FormSummary.Heading>
      </FormSummary.Header>
      <FormSummary.Answers>
        <FormSummary.Answer>
          <FormSummary.Label>Representanter for de registrerte</FormSummary.Label>
          <FormSummary.Value>
            <FormSummary.Answers>
              <FormSummary.Answer>
                <FormSummary.Label>{EPVK.behandlingAvPersonopplysninger}</FormSummary.Label>
                <FormSummary.Value>
                  <List>
                    {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
                    {personkategorier.length > 0 &&
                      personkategorier.map((personkategori) => (
                        <List.Item key={personkategori}>{personkategori}</List.Item>
                      ))}
                  </List>
                </FormSummary.Value>
              </FormSummary.Answer>
              <FormSummary.Answer>
                <FormSummary.Label id='harInvolvertRepresentant'>
                  Har dere involvert en representant for de registrerte?
                </FormSummary.Label>
                <FormSummary.Value>
                  {booleanToText(pvkDokument.harInvolvertRepresentant)}
                </FormSummary.Value>
              </FormSummary.Answer>

              <FormSummary.Answer>
                <FormSummary.Label id='representantInvolveringsBeskrivelse'>
                  Utdyp hvordan dere har involvert representant(er) for de registrerte
                </FormSummary.Label>
                <FormSummary.Value>
                  {pvkDokument.representantInvolveringsBeskrivelse && (
                    <BodyLongWithLineBreak>
                      {pvkDokument.representantInvolveringsBeskrivelse}
                    </BodyLongWithLineBreak>
                  )}
                </FormSummary.Value>
              </FormSummary.Answer>
            </FormSummary.Answers>
          </FormSummary.Value>
        </FormSummary.Answer>

        <FormSummary.Answer>
          <FormSummary.Label>Representanter for databehandlere</FormSummary.Label>
          <FormSummary.Value>
            <FormSummary.Answers>
              <FormSummary.Answer>
                <FormSummary.Label>
                  I Behandlingskatalogen står det at følgende databehandlere benyttes:
                </FormSummary.Label>
                <FormSummary.Value>
                  <List>
                    {databehandlere.length === 0 && <List.Item>Ingen</List.Item>}
                    {databehandlere.length > 0 &&
                      databehandlere.map((databehandler) => (
                        <List.Item key={databehandler}>{databehandler}</List.Item>
                      ))}
                  </List>
                </FormSummary.Value>
              </FormSummary.Answer>

              <FormSummary.Answer>
                <FormSummary.Label id='harDatabehandlerRepresentantInvolvering'>
                  Har dere involvert en representant for databehandlere?
                </FormSummary.Label>
                <FormSummary.Value>
                  {booleanToText(pvkDokument.harDatabehandlerRepresentantInvolvering)}
                </FormSummary.Value>
              </FormSummary.Answer>

              <FormSummary.Answer>
                <FormSummary.Label id='dataBehandlerRepresentantInvolveringBeskrivelse'>
                  Utdyp hvordan dere har involvert representant(er) for databehandler(e)
                </FormSummary.Label>
                <FormSummary.Value>
                  {pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse && (
                    <BodyLongWithLineBreak>
                      {pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse}
                    </BodyLongWithLineBreak>
                  )}
                </FormSummary.Value>
              </FormSummary.Answer>
            </FormSummary.Answers>
          </FormSummary.Value>
        </FormSummary.Answer>
      </FormSummary.Answers>
      <FormSummary.Footer>
        <FormSummary.EditLink
          className='cursor-pointer'
          href={`${pathName}?steg=${customStepNumber ? customStepNumber : 5}`}
        >
          Les detaljer
        </FormSummary.EditLink>
      </FormSummary.Footer>
    </FormSummary>
  )
}

export default InvolveringSummaryReadOnly
