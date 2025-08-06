'use client'

import { PageLayout } from '@/components/others/scaffold/scaffold'
import { adminCodelist } from '@/routes/admin/adminRoutes'
import { CodelistService } from '@/services/kodeverk/kodeverkService'
import { user } from '@/services/user/userService'
import { useAwait } from '@/util/hooks/customHooks/customHooks'
import { Heading, Loader, Select } from '@navikt/ds-react'
import { useParams, useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'

const CodeListAdminPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [listname, setListname] = useState('')
  const [codelistUtils] = CodelistService()
  useAwait(codelistUtils.fetchData(), setLoading)

  useEffect(() => {
    if (listname) {
      router.push(adminCodelist(listname))
    }
  }, [listname])

  if (!user.isAdmin()) {
    return (
      <div role='main'>
        <Loader size='large' className='flex justify-self-center' />
      </div>
    )
  }

  return (
    <PageLayout
      pageTitle={listname ? listname : 'Velg kodeverk'}
      currentPage='Administrering av kodeverk'
    >
      <Heading size='medium' level='1'>
        Administrering av kodeverk
      </Heading>
      {loading && <Loader size='large' />}
      {!loading && (
        <div className='flex justify-between w-full'>
          <Select
            label='Velg kodeverk'
            hideLabel
            className='w-full max-w-xl'
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setListname(event.target.value)}
          >
            <option value=''>Velg kodeverk</option>
            {codelistUtils.makeValueLabelForAllCodeLists().map(
              (
                codeLabel: {
                  value: string
                  label: string
                },
                index: number
              ) => {
                return (
                  <option key={index + '_' + codeLabel.label} value={codeLabel.value}>
                    {codeLabel.label}
                  </option>
                )
              }
            )}
          </Select>
        </div>
      )}
    </PageLayout>
  )
}

export default CodeListAdminPage
