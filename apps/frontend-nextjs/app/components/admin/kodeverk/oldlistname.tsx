import { PlusIcon } from '@navikt/aksel-icons'
import { Button, Heading, Loader, Select } from '@navikt/ds-react'
import * as React from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCodelist } from '../../../api/CodelistApi'
import { ICode, ICodeListFormValues, codelist } from '../../../services/Codelist'
import { user } from '../../../services/User'
import { useAwait, useForceUpdate } from '../../../util/hooks/customHooks'
import { PageLayout } from '../../scaffold/Page'
import CodeListTable from './CodeListStyledTable'
import ModalCreateCodeList from './ModalCreateCodeList'

const CodeListPage = () => {
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

  const handleCreateCodelist = async (values: ICodeListFormValues) => {
    setLoading(true)
    try {
      await createCodelist({ ...values } as ICode)
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
    <PageLayout
      pageTitle={listname ? listname : 'Velg kodeverk'}
      currentPage="Administrering av kodeverk"
    >
      <Heading size="medium" level="1">
        Administrering av kodeverk
      </Heading>
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
            {codelist.makeValueLabelForAllCodeLists().map((codeLabel, index) => {
              return (
                <option key={index + '_' + codeLabel.label} value={codeLabel.value}>
                  {codeLabel.label}
                </option>
              )
            })}
          </Select>
          {listname && (
            <Button
              icon={<PlusIcon area-label="" aria-hidden />}
              variant="tertiary"
              onClick={() => setCreateCodeListModal(!createCodeListModal)}
            >
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
      {listname && createCodeListModal && (
        <ModalCreateCodeList
          title="Ny kode"
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

export default CodeListPage
