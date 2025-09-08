import { BodyShort, FormSummary, Link, Tag } from '@navikt/ds-react'
import { FunctionComponent, ReactNode } from 'react'
import { EPvkDokumentStatus } from '../../../constants'

type TFormSummaryPanelProps = {
  title: string
  onClick: () => void
  href: string
  step: number
  pvkDokumentStatus: EPvkDokumentStatus
  status?: ReactNode
  customStatusTag?: ReactNode
  pvoView?: boolean
}

export const pvkDokumentStatusToText = (status: EPvkDokumentStatus) => {
  switch (status) {
    case EPvkDokumentStatus.AKTIV:
      return 'Under arbeid'
    case EPvkDokumentStatus.UNDERARBEID:
      return 'Under arbeid'
    case EPvkDokumentStatus.SENDT_TIL_PVO:
      return 'Sendt inn til Personvernombudet'
    case EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING:
      return 'Sendt tilbake til Personvernombudet for revurdering'
    case EPvkDokumentStatus.PVO_UNDERARBEID:
      return 'Personvernombudet har påbegynt vurderingen'
    case EPvkDokumentStatus.VURDERT_AV_PVO:
      return 'Vurdert av Personvernombudet'
    case EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID:
      return 'Vurdert av Personvernombudet, og dokumentet trenger mer arbeid'
    case EPvkDokumentStatus.TRENGER_GODKJENNING:
      return 'Sendt til Risikoeier for godkjenning'
    case EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER:
      return 'Godkjent av Risikoeier'
  }
}

export const FormSummaryPanel: FunctionComponent<TFormSummaryPanelProps> = ({
  title,
  onClick,
  href,
  status,
  customStatusTag,
  pvkDokumentStatus,
  step,
  pvoView,
}) => (
  <FormSummary.Answer key={title}>
    <FormSummary.Value>
      <Link onClick={onClick} href={href} className='cursor-pointer'>
        {title}
      </Link>
    </FormSummary.Value>
    <FormSummary.Value>
      {status && !customStatusTag && status}
      {customStatusTag && customStatusTag}
      {step === 5 && (
        <Tag
          variant={pvkDokumentStatus !== EPvkDokumentStatus.UNDERARBEID ? 'info' : 'warning'}
          size='xsmall'
        >
          {pvkDokumentStatusToText(pvkDokumentStatus)}
        </Tag>
      )}
      {!pvoView && step === 5 && (
        <BodyShort>
          Her får dere oversikt over alle deres svar.{' '}
          {pvkDokumentStatus === EPvkDokumentStatus.UNDERARBEID &&
            'PVK-dokumentasjon er ikke ennå sendt inn.'}
        </BodyShort>
      )}
    </FormSummary.Value>
  </FormSummary.Answer>
)

export default FormSummaryPanel
