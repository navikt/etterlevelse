'use client'

import { getAuditLog } from '@/api/audit/auditApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IAuditItem, IAuditLog } from '@/constants/admin/audit/auditConstants'
import { adminAuditUrl } from '@/routes/admin/audit/auditRoutes'
import { useRefs } from '@/util/hooks/customHooks/customHooks'
import { Box, Heading, Label, Loader } from '@navikt/ds-react'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import AuditItemList from './AuditItemList'
import AuditOversiktView from './AuditOversiktView'

export const AuditViewPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const auditId = searchParams.get('auditId')
  const id = params.id
  const [isLoading, setIsloading] = useState<boolean>(false)
  const [auditLog, setAuditLog] = useState<IAuditLog>()
  const [newestAudit, setNewestAudit] = useState<IAuditItem>()
  const [logNotFound, setLogNotFound] = useState<boolean>(false)
  const [openAll, setOpenAll] = useState(false)
  const refs = useRefs<HTMLDivElement>(auditLog?.audits.map((auditLog) => auditLog.id) || [])

  useEffect(() => {
    ;(async () => {
      if (id) {
        setIsloading(true)
        await getAuditLog(id as string)
          .then((response) => {
            setAuditLog(response)
            if (response.audits.length === 0) {
              setLogNotFound(true)
            } else {
              setNewestAudit(response.audits[0])
              setLogNotFound(false)
            }
          })
          .finally(() => setIsloading(false))
      }
    })()
  }, [])

  useEffect(() => {
    if (auditId && auditLog && refs[auditId] && auditId !== auditLog.audits[0].id) {
      refs[auditId].current!.scrollIntoView({ block: 'start' })
    }
  }, [auditId, auditLog])

  return (
    <PageLayout
      pageTitle='Versjon view'
      currentPage='Versjon view'
      breadcrumbPaths={[
        {
          pathName: 'Versjonering',
          href: adminAuditUrl(),
        },
      ]}
    >
      <Suspense>
        <Heading size='medium' level='1'>
          Versjonering
        </Heading>

        {isLoading && <Loader size={'large'} className='flex justify-self-center' />}

        {!isLoading && (
          <Box background='surface-default' padding='4'>
            {logNotFound && <Label>Audit ikke funnet</Label>}

            {!logNotFound && auditLog && newestAudit && (
              <div>
                <AuditOversiktView
                  auditLog={auditLog}
                  newestAudit={newestAudit}
                  openAll={openAll}
                  setOpenAll={setOpenAll}
                />

                <AuditItemList auditLog={auditLog} openAll={openAll} refs={refs} />
              </div>
            )}
          </Box>
        )}
      </Suspense>
    </PageLayout>
  )
}

export default AuditViewPage
