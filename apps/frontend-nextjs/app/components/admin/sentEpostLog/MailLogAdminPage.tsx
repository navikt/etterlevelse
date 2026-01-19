'use client'

import { getMailLog } from '@/api/audit/auditApi'
import { Markdown } from '@/components/common/markdown/markdown'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IMailLog } from '@/constants/admin/audit/auditConstants'
import { IPageResponse } from '@/constants/commonConstants'
import { BodyShort, Box, Heading, Pagination, Select, Spacer } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'

const MailLogAdminPage = () => {
  const [log, setLog] = useState<IPageResponse<IMailLog>>({
    content: [],
    numberOfElements: 0,
    pageNumber: 0,
    pages: 0,
    pageSize: 1,
    totalElements: 0,
  })
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  useEffect(() => {
    getMailLog(page - 1, rowsPerPage).then(setLog)
  }, [page, rowsPerPage])

  return (
    <PageLayout pageTitle='Sendt e-post log' currentPage='Sendt e-post log'>
      <Heading spacing size='medium' level='1'>
        Sendt e-post log
      </Heading>
      {log?.content.map((mailLog, index) => {
        let html = mailLog.body
        const bodyIdx = mailLog.body.indexOf('<body>')
        if (bodyIdx >= 0) {
          html = html.substring(mailLog.body.indexOf('<body>') + 6)
          html = html.substring(0, html.lastIndexOf('</body>'))
        }
        // some odd bug in html parser didnt like newlines inside <ul>
        html = html.replace(/\n/g, '')
        const rowNum = log.pageNumber * log.pageSize + index + 1

        return (
          <div key={index} className='mb-6'>
            <BodyShort>
              #{rowNum} Tid: {moment(mailLog.time).format('LLL')} Til: {mailLog.to}
            </BodyShort>
            <BodyShort className='mb-3'>Emne: {mailLog.subject}</BodyShort>
            <Box
              className='px-2'
              borderWidth='2'
              borderColor='neutral-subtle'
              borderRadius='12'
              background='default'
            >
              <Markdown source={html} escapeHtml={false} />
            </Box>
          </div>
        )
      })}

      <div className='flex w-full justify-center items-center mt-3'>
        <Select
          label='Antall rader:'
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
          size='small'
        >
          <option value='5'>5</option>
          <option value='10'>10</option>
          <option value='20'>20</option>
          <option value='50'>50</option>
          <option value='100'>100</option>
        </Select>
        <Spacer />
        <div>
          <Pagination
            page={page}
            onPageChange={setPage}
            count={log.pages ? log.pages : 1}
            prevNextTexts
            size='small'
          />
        </div>
        <Spacer />
        <BodyShort>Totalt antall rader: {log.totalElements}</BodyShort>
      </div>
    </PageLayout>
  )
}

export default MailLogAdminPage
