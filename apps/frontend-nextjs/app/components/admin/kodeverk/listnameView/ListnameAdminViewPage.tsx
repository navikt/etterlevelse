'use client'

import { PageLayout } from '@/components/others/scaffold/scaffold'
import { adminCodelist, adminUrl } from '@/routes/admin/adminRoutes'
import { codelist } from '@/services/kodeverk/kodeverkService'
import { user } from '@/services/user/userService'
import { Heading, Loader, Select } from '@navikt/ds-react'
import { useParams, useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'

export const ListnameAdminViewPage = () => {
  const params = useParams()
  const router = useRouter()
  const listname = params.listname
  const [selectedListname, setSelectedListname] = useState<string>(listname as string)

  useEffect(() => {
    if (selectedListname && selectedListname !== listname) {
      router.push(adminCodelist(selectedListname))
    }
  }, [selectedListname])

  return (
    <PageLayout
      pageTitle={listname ? (listname as string) : 'Velg kodeverk'}
      currentPage={'Administrering av ' + listname}
      breadcrumbPaths={[
        {
          pathName: 'Administrering av kodeverk',
          href: adminUrl + '/codelist',
        },
      ]}
    >
      <Heading size='medium' level='1'>
        Administrering av {listname}
      </Heading>

      {user.isAdmin() && (
        <div className='flex justify-between w-full'>
          <Select
            label='Velg kodeverk'
            hideLabel
            className='w-full max-w-xl'
            value={selectedListname}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setSelectedListname(event.target.value)
            }
          >
            <option value=''>Velg kodeverk</option>
            {codelist.makeValueLabelForAllCodeLists().map(
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

      {!user.isAdmin() && (
        <div role='main'>
          <Loader size='large' className='flex justify-self-center' />
        </div>
      )}
    </PageLayout>
  )
}
export default ListnameAdminViewPage
