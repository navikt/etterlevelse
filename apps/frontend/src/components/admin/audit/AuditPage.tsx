import {Block} from "baseui/block"
import React, {useEffect, useState} from "react"
import {useHistory, useParams} from "react-router-dom"
import {Input} from "baseui/input"
import _ from "lodash"
import {H4, Paragraph2} from "baseui/typography"
import {AuditLog} from './AuditTypes'
import {getAuditLog} from './AuditApi'
import {AuditView} from './AuditView'
import {AuditRecentTable} from './AuditRecentTable'
import {AuditLabel} from './AuditComponents'
import {useDebouncedState} from '../../../util/hooks'
import {intl} from '../../../util/intl/intl'

const format = (id: string) => _.trim(id, "\"")

export const AuditPage = () => {
  const params = useParams<{id?: string, auditId?: string}>()
  const history = useHistory()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [auditLog, setAuditLog] = useState<AuditLog>()
  const [idSearch, setIdInput, idInput] = useDebouncedState(params.id || '', 400)

  const lookupVersion = (id?: string) => {
    (async () => {
      if (id === auditLog?.id) {
        return
      }
      setAuditLog(undefined)
      setError(undefined)
      if (!id) {
        !!params.id && history.push('/admin/audit')
        return
      }
      setLoading(true)
      try {
        const log = await getAuditLog(_.escape(id))
        setAuditLog(log)
        if (log.audits.length && id !== params.id) {
          history.push(`/admin/audit/${id}`)
        }
      } catch (e) {
        setError(e)
      }
      setLoading(false)
    })()
  }

  useEffect(() => setIdInput(params.id || ''), [params.id])
  useEffect(() => lookupVersion(idSearch), [idSearch])

  return (
    <>
      <H4>{intl.audit}</H4>
      <Block marginBottom="1rem">
        <AuditLabel label={intl.searchId}>
          <Input size="compact" value={idInput}
                 overrides={{Input: {style: {width: '300px'}}}}
                 placeholder={intl.id}
                 onChange={e => setIdInput(format((e.target as HTMLInputElement).value))}
          />
        </AuditLabel>
      </Block>

      {error && <Paragraph2>{_.escape(error)}</Paragraph2>}
      {idInput && <AuditView auditLog={auditLog} auditId={params.auditId} loading={loading} viewId={lookupVersion}/>}
      <AuditRecentTable show={!idInput}/>
    </>
  )
}
