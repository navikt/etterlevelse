import { BodyShort, FormSummary, Link, Tag } from '@navikt/ds-react'
import { FunctionComponent, ReactNode } from 'react'
import { EPvkDokumentStatus } from '../../../constants'

type TFormSummaryPanelProps = {
  title: string
  onClick: () => void
  href: string
  step: number
  pvkDokumentStatus: EPvkDokumentStatus
  status?: 'Under arbeid' | 'Ikke påbegynt'
  customStatusTag?: ReactNode
}

export const pvkDokumentStatusToText = (status: EPvkDokumentStatus) => {
  switch (status) {
    case EPvkDokumentStatus.AKTIV:
      return 'Under arbeid'
    case EPvkDokumentStatus.UNDERARBEID:
      return 'Under arbeid'
    case EPvkDokumentStatus.SENDT_TIL_PVO:
      return 'Sendt inn til Personvernombudet'
    case EPvkDokumentStatus.VURDERT_AV_PVO:
      return 'Vurdert av Personvernombudet'
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
}) => {
  return (
    <FormSummary.Answer key={title}>
      <FormSummary.Value>
        <Link onClick={onClick} href={href} className='cursor-pointer'>
          {title}
        </Link>
      </FormSummary.Value>
      <FormSummary.Value>
        {status && !customStatusTag && (
          <Tag variant={status === 'Under arbeid' ? 'warning' : 'neutral'} size='xsmall'>
            {status}
          </Tag>
        )}
        {customStatusTag && customStatusTag}
        {step === 4 && (
          <Tag
            variant={pvkDokumentStatus !== EPvkDokumentStatus.UNDERARBEID ? 'info' : 'warning'}
            size='xsmall'
          >
            {pvkDokumentStatusToText(pvkDokumentStatus)}
          </Tag>
        )}
        {step === 4 && (
          <BodyShort>
            Her får dere oversikt over alle deres svar.{' '}
            {pvkDokumentStatus === EPvkDokumentStatus.UNDERARBEID &&
              'PVK-dokumentasjon er ikke ennå sendt inn.'}
          </BodyShort>
        )}
      </FormSummary.Value>
    </FormSummary.Answer>
  )
}

export default FormSummaryPanel
