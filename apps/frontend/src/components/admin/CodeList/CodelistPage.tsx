import * as React from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAwait, useForceUpdate } from '../../../util/hooks'
import { Code, codelist, CodeListFormValues } from '../../../services/Codelist'
import { createCodelist } from '../../../api/CodelistApi'
import { user } from '../../../services/User'
import CreateCodeListModal from './ModalCreateCodeList'
import CodeListTable from './CodeListStyledTable'
import { Helmet } from 'react-helmet'
import { Button, Heading, Loader, Select } from '@navikt/ds-react'
import { PlusIcon } from '@navikt/aksel-icons'

const CodeListPage = () => {
  const params = useParams<{ listname?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [listname, setListname] = React.useState(params.listname)
  const [errorOnResponse, setErrorOnResponse] = React.useState(null)
  const forceUpdate = useForceUpdate()
  const createCodeListModalRef = React.useRef<HTMLDialogElement>(null)
  useAwait(codelist.wait(), setLoading)

  const lists = codelist.lists?.codelist
  const currentCodelist = lists && listname ? lists[listname] : undefined

  const handleCreateCodelist = async (values: CodeListFormValues) => {
    setLoading(true)
    try {
      await createCodelist({ ...values } as Code)
      await codelist.refreshCodeLists()
    } catch (error: any) {
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
      <div role="main" >
        <Loader size="large" />
      </div>
    )
  }

  return (
    <div role="main" className="px-8 w-full">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{listname ? listname : 'Velg kodeverk'} </title>
      </Helmet>
      <Heading size="xlarge">Administrering av kodeverk</Heading>
      {loading ? (
        <Loader size="large" />
      ) : (
        <div className="flex justify-between w-full">
          <Select
            label="Velg kodeverk"
            hideLabel
            className="w-full max-w-xl"
            onChange={(e) => setListname(e.target.value)}
          >
            <option value="">Velg kodeverk</option>
            {codelist.makeIdLabelForAllCodeLists().map((c) => {
              return <option value={c.id}>{c.label}</option>
            })}
          </Select>
          {listname && (
            <Button icon={<PlusIcon />} variant="tertiary" onClick={() => createCodeListModalRef.current?.showModal()}>
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
        modalRef={createCodeListModalRef}
        errorOnCreate={errorOnResponse}
        onClose={() => {
          createCodeListModalRef.current?.showModal()
          setErrorOnResponse(null)
        }}
        submit={handleCreateCodelist}
      />
    </div>
  )
}

export default CodeListPage
