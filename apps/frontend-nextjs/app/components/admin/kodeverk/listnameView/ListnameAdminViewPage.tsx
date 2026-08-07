'use client'

import { createCodelist } from '@/api/kodeverk/kodeverkApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { ICode, ICodeListFormValues } from '@/constants/kodeverk/kodeverkConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { adminCodelist, adminUrl } from '@/routes/admin/adminRoutes'
import { useForceUpdate } from '@/util/hooks/customHooks/customHooks'
import { Heading, Loader } from '@navikt/ds-react'
import { useParams, useRouter } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import ModalCreateCodeList from '../edit/ModalCreateCodeList'
import VelgKodeverk from '../velgKodeverk/velgKodeverk'
import CodeListTable from './CodelistStyledTable'

export const ListnameAdminViewPage = () => {
  const params = useParams()
  const router = useRouter()
  const listname = params.listname as string
  const [selectedListname, setSelectedListname] = useState<string>(listname)
  const [isLoading, setIsLoading] = useState(true)
  const [createCodeListModal, setCreateCodeListModal] = useState(false)
  const [errorOnResponse, setErrorOnResponse] = useState(null)
  const forceUpdate = useForceUpdate()
  const codelist = useContext(CodelistContext)

  const lists = codelist.lists?.codelist
  const currentCodelist = lists && listname ? lists[listname] : undefined

  useEffect(() => {
    if (selectedListname && selectedListname !== listname) {
      router.push(adminCodelist(selectedListname))
    }
  }, [selectedListname])

  // Set isLoading to false when data is loaded
  useEffect(() => {
    ;(async () => {
      if (lists && listname && lists[listname]) {
        setIsLoading(false)
      }
    })()
  }, [lists, listname])

  const handleCreateCodelist = async (values: ICodeListFormValues) => {
    setIsLoading(true)
    try {
      await createCodelist({ ...values } as ICode)
      await codelist.utils.fetchData(true)
      setCreateCodeListModal(false)
    } catch (error: any) {
      setCreateCodeListModal(true)
      setErrorOnResponse(error.message)
    }
    setIsLoading(false)
  }

  const update = async () => {
    await codelist.utils.fetchData(true)
    forceUpdate()
  }

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

      <VelgKodeverk
        selectedListname={selectedListname}
        setSelectedListname={setSelectedListname}
        codelist={codelist}
        listname={listname}
        setCreateCodeListModal={setCreateCodeListModal}
        createCodeListModal={createCodeListModal}
      />

      {isLoading && <Loader size='large' />}

      {!isLoading && currentCodelist && (
        <div className='mt-4'>
          <CodeListTable tableData={currentCodelist || []} refresh={update} />
        </div>
      )}

      {listname && createCodeListModal && (
        <ModalCreateCodeList
          title='Ny kode'
          list={listname}
          isOpen={createCodeListModal}
          errorOnCreate={errorOnResponse}
          onClose={() => {
            setCreateCodeListModal(false)
            setErrorOnResponse(null)
          }}
          submit={handleCreateCodelist}
        />
      )}
    </PageLayout>
  )
}
export default ListnameAdminViewPage
