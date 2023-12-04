import * as React from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAwait, useForceUpdate } from '../../../util/hooks'
import { Code, codelist, CodeListFormValues } from '../../../services/Codelist'
import { createCodelist } from '../../../api/CodelistApi'
import { useUser } from '../../../services/User'
import CreateCodeListModal from './ModalCreateCodeList'
import CodeListTable from './CodeListStyledTable'
import { Helmet } from 'react-helmet'
import { Button, Heading, Loader, Select } from '@navikt/ds-react'
import { PlusIcon } from '@navikt/aksel-icons'
import CustomizedBreadcrumbs from '../../common/CustomizedBreadcrumbs'

const CodeListPage = () => {
  const user = useUser
  const params = useParams<{ listname?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [listname, setListname] = React.useState(params.listname)
  const [createCodeListModal, setCreateCodeListModal] = React.useState(false)
  const [errorOnResponse, setErrorOnResponse] = React.useState(null)
  const forceUpdate = useForceUpdate()
  useAwait(codelist.wait(), setLoading)

  const lists = codelist.lists?.codelist
  const currentCodelist = lists && listname ? lists[listname] : undefined

  const handleCreateCodelist = async (values: CodeListFormValues) => {
    setLoading(true)
    try {
      await createCodelist({ ...values } as Code)
      await codelist.refreshCodeLists()
      setCreateCodeListModal(false)
    } catch (error: any) {
      setCreateCodeListModal(true)
      setErrorOnResponse(error.message)
    }
    setLoading(false)
  }

  const update = async () => {
    await codelist.refreshCodeLists()
    forceUpdate()
  }

  useEffect(() => {
    if (listname && listname !== params.listname) {
      navigate(`/admin/codelist/${listname}`, { replace: true })
    }
  }, [listname, lists])

  if (!user.isAdmin() || !lists) {
    return (
      <div role="main">
        <Loader size="large" />
      </div>
    )
  }

  return (
    <div role="main" id="content" className="w-full">
      <div className="flex-1 justify-start flex">
        <CustomizedBreadcrumbs currentPage="Administrering av kodeverk" />
      </div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{listname ? listname : 'Velg kodeverk'} </title>
      </Helmet>
      <Heading size="medium" level="1">
        Administrering av kodeverk
      </Heading>
      {loading ? (
        <Loader size="large" />
      ) : (
        <div className="flex justify-between w-full">
          <Select label="Velg kodeverk" hideLabel className="w-full max-w-xl" onChange={(e) => setListname(e.target.value)}>
            <option value="">Velg kodeverk</option>
            {codelist.makeIdLabelForAllCodeLists().map((c, i) => {
              return (
                <option key={i + '_' + c.label} value={c.id}>
                  {c.label}
                </option>
              )
            })}
          </Select>
          {listname && (
            <Button icon={<PlusIcon area-label="" aria-hidden />} variant="tertiary" onClick={() => setCreateCodeListModal(!createCodeListModal)}>
              Opprett ny kode
            </Button>
          )}
        </div>
      )}

      {!loading && currentCodelist && (
        <div className="mt-4">
          <CodeListTable tableData={currentCodelist || []} refresh={update} />
        </div>
      )}

      <CreateCodeListModal
        title="Ny kode"
        list={listname!}
        isOpen={createCodeListModal}
        errorOnCreate={errorOnResponse}
        onClose={() => {
          setCreateCodeListModal(false)
          setErrorOnResponse(null)
        }}
        submit={handleCreateCodelist}
      />
    </div>
  )
}

export default CodeListPage
