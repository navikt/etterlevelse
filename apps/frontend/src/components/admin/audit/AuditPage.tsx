import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import _ from 'lodash'
import { AuditLog } from './AuditTypes'
import { getAuditLog } from '../../../api/AuditApi'
import { AuditView } from './AuditView'
import { AuditRecentTable } from './AuditRecentTable'
import { AuditLabel } from './AuditComponents'
import { useDebouncedState } from '../../../util/hooks'
import { intl } from '../../../util/intl/intl'
import { Helmet } from 'react-helmet'
import { BodyLong, Heading, TextField } from '@navikt/ds-react'
import CustomizedBreadcrumbs from '../../common/CustomizedBreadcrumbs'
import { PageLayout } from '../../scaffold/Page'

const format = (id: string) => _.trim(id, '"')

export const AuditPage = () => {
  const params = useParams<{ id?: string; auditId?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [auditLog, setAuditLog] = useState<AuditLog>()
  const [idSearch, setIdInput, idInput] = useDebouncedState(params.id || '', 400)

  const lookupVersion = (id?: string) => {
    ;(async () => {
      if (id === auditLog?.id) {
        return
      }
      setAuditLog(undefined)
      setError(undefined)
      if (!id) {
        !!params.id && navigate('/admin/audit')
        return
      }
      setLoading(true)
      try {
        const log = await getAuditLog(_.escape(id))
        setAuditLog(log)
        if (log.audits.length && id !== params.id) {
          navigate(`/admin/audit/${id}`)
        }
      } catch (e: any) {
        setError(e)
      }
      setLoading(false)
    })()
  }

  useEffect(() => setIdInput(params.id || ''), [params.id])
  useEffect(() => lookupVersion(idSearch), [idSearch])

  return (
    <PageLayout
      pageTitle="Versjonering"
      currentPage="Versjonering" 
    >
      <Heading size="medium" level="1">
        {intl.audit}
      </Heading>
      <div className="my-4">
        <AuditLabel label={intl.searchId}>
          <TextField
            label={intl.searchId}
            hideLabel
            value={idInput}
            placeholder={intl.id}
            onChange={(e) => setIdInput(format((e.target as HTMLInputElement).value))}
            className="w-72"
          />
        </AuditLabel>
      </div>

      {error && <BodyLong>{_.escape(error)}</BodyLong>}
      {idInput && <AuditView auditLog={auditLog} auditId={params.auditId} loading={loading} viewId={lookupVersion} />}
      <AuditRecentTable show={!idInput} />
    </PageLayout>
  )
}
