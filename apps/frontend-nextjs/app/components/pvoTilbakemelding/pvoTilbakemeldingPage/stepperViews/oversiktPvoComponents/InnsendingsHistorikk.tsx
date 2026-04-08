'use client'

import { getAuditByTableIdAndTimeStamp } from '@/api/audit/auditApi'
import { mapPvkDokumentToFormValue } from '@/api/pvkDokument/pvkDokumentApi'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IMeldingTilPvo,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Label, List, Loader, ReadMore } from '@navikt/ds-react'
import { ListItem } from '@navikt/ds-react/List'
import moment from 'moment'
import { Fragment, FunctionComponent, useEffect, useState } from 'react'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument: IPvkDokument
  vurderinger: IVurdering[]
  meldingerTilPvo: IMeldingTilPvo[]
}

interface IInnsendingHistroikkProps extends TProps {
  versjon: number
}

export const InnsendingHistorikk: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  meldingerTilPvo,
  vurderinger,
}) => {
  const [isReadMoreOpen, setIsReadMoreOpen] = useState<boolean>(false)
  const versjoner = [
    ...new Set(meldingerTilPvo.map((melding) => melding.etterlevelseDokumentVersjon)),
  ].sort((a, b) => a - b)

  return (
    <div>
      <ReadMore
        header='Vis innsendingshistorikken'
        open={isReadMoreOpen}
        onClick={() => setIsReadMoreOpen(!isReadMoreOpen)}
      >
        {isReadMoreOpen &&
          versjoner.map((versjon) => (
            <InnsendingHistorikkContent
              key={'innsending_' + versjon}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              versjon={versjon}
              pvkDokument={pvkDokument}
              meldingerTilPvo={meldingerTilPvo}
              vurderinger={vurderinger}
            />
          ))}
      </ReadMore>
    </div>
  )
}

const InnsendingHistorikkContent: FunctionComponent<IInnsendingHistroikkProps> = ({
  versjon,
  etterlevelseDokumentasjon,
  pvkDokument,
  meldingerTilPvo,
  vurderinger,
}) => {
  const [auditLogPvk, setAuditLogPvk] = useState<IPvkDokument>()
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>()
  const meldingerTilPvoForVersjon = meldingerTilPvo.filter(
    (melding) => melding.etterlevelseDokumentVersjon === versjon
  )

  useEffect(() => {
    ;(async () => {
      setIsAuditLoading(true)
      if (versjon < etterlevelseDokumentasjon.etterlevelseDokumentVersjon) {
        const versjonHistrokk = etterlevelseDokumentasjon.versjonHistorikk.filter(
          (historikk) => historikk.versjon === versjon
        )[0]

        await getAuditByTableIdAndTimeStamp(
          pvkDokument.id,
          versjonHistrokk.godkjentAvRisikoierDato || ''
        ).then((auditResponse) => {
          if (auditResponse.length !== 0) {
            const previousData = (auditResponse[0].data as { pvkDokumentData?: IPvkDokument })[
              'pvkDokumentData'
            ]

            const status = (auditResponse[0].data as IPvkDokument)['status']
            setAuditLogPvk(mapPvkDokumentToFormValue({ ...previousData, status }))
          }
        })
      } else {
        setAuditLogPvk(pvkDokument)
      }
      setIsAuditLoading(false)
    })()
  }, [etterlevelseDokumentasjon])

  if (meldingerTilPvoForVersjon.length === 0) {
    return null
  }

  return (
    <div className='mb-5' key={'innsending_' + versjon}>
      <Label>Versjon {versjon}</Label>
      <List>
        {meldingerTilPvoForVersjon.map((melding, index) => {
          if (
            pvkDokument.antallInnsendingTilPvo >= melding.innsendingId &&
            melding.sendtTilPvoDato
          ) {
            const melderNavn = ![undefined, null, ''].includes(melding.sendtTilPvoAv)
              ? melding.sendtTilPvoAv.split(' - ')[1]
              : ''
            const vurdering = vurderinger.filter(
              (vurdering) =>
                vurdering.innsendingId === melding.innsendingId &&
                vurdering.etterlevelseDokumentVersjon === melding.etterlevelseDokumentVersjon
            )
            const sendtAvPvo =
              vurdering.length !== 0 && vurdering[0].sendtAv !== '' && vurdering[0].sendtAv !== null
                ? vurdering[0].sendtAv.split(' - ')[1]
                : 'Personvernombudet'

            return (
              <Fragment key={`melding_${index}_innsending_${melding.innsendingId}`}>
                <List.Item key={`etterleveler_${index}_innsending_${melding.innsendingId}`}>
                  {moment(melding.sendtTilPvoDato).format('DD. MMM YYYY')}
                  &nbsp;&nbsp;&nbsp;
                  {melding.innsendingId}. innsending til PVO av {melderNavn}
                </List.Item>

                {vurdering.length !== 0 && vurdering[0].sendtDato && (
                  <ListItem key={`${index}_innsending_${melding.innsendingId}_vurdering`}>
                    {moment(vurdering[0].sendtDato).format('DD. MMM YYYY')}
                    &nbsp;&nbsp;&nbsp;tilbakemelding fra {sendtAvPvo}
                  </ListItem>
                )}
              </Fragment>
            )
          }
        })}

        {isAuditLoading && <Loader />}
        {!isAuditLoading &&
          auditLogPvk &&
          auditLogPvk.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER && (
            <List.Item>
              {moment(auditLogPvk.godkjentAvRisikoeierDato).format('DD. MMM YYYY')}
              &nbsp;&nbsp;&nbsp;godkjent av {auditLogPvk.godkjentAvRisikoeier.split(' - ')[1]}{' '}
              (Risikoeier)
            </List.Item>
          )}
      </List>
    </div>
  )
}

export default InnsendingHistorikk
