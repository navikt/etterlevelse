'use client'

import { getAuditByTableIdAndTimeStamp } from '@/api/audit/auditApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import {
  IEtterlevelseVersjonHistorikk,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Accordion, FormSummary } from '@navikt/ds-react'
import { Heading } from '@navikt/ds-react/Typography'
import moment from 'moment'
import { FunctionComponent, useEffect, useState } from 'react'
import { GodkjenningAvRisikoeierKravFormSummary } from './godkjenningAvRisikoeierKravFormSummary'
import { GodkjenningAvRisikoeierPvkFormSummary } from './godkjenningAvRisikoeierPvkFormSummary'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const EtterlevelsesDokumentasjonGodkjenningsHistorikk: FunctionComponent<IProps> = ({
  etterlevelseDokumentasjon,
}) => {
  const [openItemId, setOpenItemId] = useState<string | null>(null)

  return (
    <div className='my-5 max-w-[75ch]'>
      <Heading level='2' size='medium' className='mb-5'>
        Godkjenningshistorikk
      </Heading>

      <Accordion>
        {etterlevelseDokumentasjon.versjonHistorikk.map((versjon, index) => {
          const itemId = `${versjon.versjon}_historikk_${index}`
          const expanded = openItemId === itemId
          if (versjon.versjon !== etterlevelseDokumentasjon.etterlevelseDokumentVersjon) {
            return (
              <Accordion.Item
                id={itemId}
                key={itemId}
                open={expanded}
                onOpenChange={(open: boolean) => setOpenItemId(open ? itemId : null)}
              >
                <Accordion.Header>
                  Versjon {versjon.versjon}, godkjent av {versjon.godkjentAvRisikoeier},{' '}
                  {moment(versjon.godkjentAvRisikoierDato).format('LL')}
                </Accordion.Header>
                <Accordion.Content>
                  {expanded && (
                    <GodkjenningsHistorikkContent
                      versjonHistorikk={versjon}
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    />
                  )}
                </Accordion.Content>
              </Accordion.Item>
            )
          }
        })}
      </Accordion>
    </div>
  )
}

interface IGodkjenningsHistorikkContentProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  versjonHistorikk: IEtterlevelseVersjonHistorikk
}

const GodkjenningsHistorikkContent: FunctionComponent<IGodkjenningsHistorikkContentProps> = ({
  versjonHistorikk,
  etterlevelseDokumentasjon,
}) => {
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      await getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id).then(
        async (pvkResponse) => {
          if (pvkResponse && versjonHistorikk.godkjentAvRisikoierDato) {
            await getAuditByTableIdAndTimeStamp(
              pvkResponse.id,
              versjonHistorikk.godkjentAvRisikoierDato
            ).then((auditResponse) => {
              if (auditResponse.length !== 0) {
                const previousData = (auditResponse[0].data as { pvkDokumentData?: IPvkDokument })[
                  'pvkDokumentData'
                ]
                setPvkDokument(previousData)
              }
            })
          }
        }
      )
      setIsLoading(false)
    })()
  }, [])

  return (
    <div>
      {isLoading && <CenteredLoader />}
      {!isLoading && (
        <div>
          <FormSummary>
            <FormSummary.Header>
              <Heading level='2' size='small'>
                Oversikt over etterlevelsen
              </Heading>
            </FormSummary.Header>
            <FormSummary.Answers>
              {versjonHistorikk.kravTilstandHistorikk !== undefined &&
                versjonHistorikk.kravTilstandHistorikk.map((kravHistorikk, index) => {
                  return (
                    <GodkjenningAvRisikoeierKravFormSummary
                      kravHistorikk={kravHistorikk}
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      index={index}
                    />
                  )
                })}

              <GodkjenningAvRisikoeierPvkFormSummary pvkDokument={pvkDokument} />
            </FormSummary.Answers>
          </FormSummary>
        </div>
      )}
    </div>
  )
}

export default EtterlevelsesDokumentasjonGodkjenningsHistorikk
