import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { BodyShort, FormSummary, Tag } from '@navikt/ds-react'
import Link from 'next/link'
import { FunctionComponent, ReactNode } from 'react'

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
