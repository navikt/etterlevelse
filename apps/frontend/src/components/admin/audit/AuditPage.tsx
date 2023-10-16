import { Block } from 'baseui/block'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import _ from 'lodash'
import { HeadingXXLarge, ParagraphMedium } from 'baseui/typography'
import { AuditLog } from './AuditTypes'
import { getAuditLog } from '../../../api/AuditApi'
import { AuditView } from './AuditView'
import { AuditRecentTable } from './AuditRecentTable'
import { AuditLabel } from './AuditComponents'
import { useDebouncedState } from '../../../util/hooks'
import { intl } from '../../../util/intl/intl'
import CustomInput from '../../common/CustomizedInput'
import { responsivePaddingSmall, responsiveWidthSmall } from '../../../util/theme'
import { Helmet } from 'react-helmet'

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
    <Block width={responsiveWidthSmall} paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} overrides={{ Block: { props: { role: 'main' } } }}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Versjonering</title>
      </Helmet>
      <HeadingXXLarge>{intl.audit}</HeadingXXLarge>
      <Block marginBottom="1rem">
        <AuditLabel label={intl.searchId}>
          <CustomInput
            size="compact"
            value={idInput}
            overrides={{ Input: { style: { width: '300px' } } }}
            placeholder={intl.id}
            onChange={(e) => setIdInput(format((e.target as HTMLInputElement).value))}
          />
        </AuditLabel>
      </Block>

      {error && <ParagraphMedium>{_.escape(error)}</ParagraphMedium>}
      {idInput && <AuditView auditLog={auditLog} auditId={params.auditId} loading={loading} viewId={lookupVersion} />}
      <AuditRecentTable show={!idInput} />
    </Block>
  )
}
