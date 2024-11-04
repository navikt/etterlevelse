import { PlusIcon } from '@navikt/aksel-icons'
import { Button, Heading, Loader, Select } from '@navikt/ds-react'
import { ChangeEvent, useEffect, useState } from 'react'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { createCodelist } from '../../../api/CodelistApi'
import { CodelistService, ICode, ICodeListFormValues } from '../../../services/Codelist'
import { user } from '../../../services/User'
import { useAwait, useForceUpdate } from '../../../util/hooks/customHooks'
import { PageLayout } from '../../scaffold/Page'
import CodeListTable from './CodeListStyledTable'
import ModalCreateCodeList from './ModalCreateCodeList'

const CodeListPage = () => {
  const params: Readonly<
    Partial<{
      listname?: string
    }>
  > = useParams<{ listname?: string }>()
  const navigate: NavigateFunction = useNavigate()
  const [loading, setLoading] = useState(true)
  const [listname, setListname] = useState(params.listname)
  const [createCodeListModal, setCreateCodeListModal] = useState(false)
  const [errorOnResponse, setErrorOnResponse] = useState(null)
  const forceUpdate: () => void = useForceUpdate()
  const [codelistUtils, lists] = CodelistService()
  useAwait(codelistUtils.fetchData(), setLoading)

  const currentCodelist: ICode[] | undefined =
    lists && listname ? lists.codelist[listname] : undefined

  const handleCreateCodelist = async (values: ICodeListFormValues): Promise<void> => {
    setLoading(true)
    try {
      await createCodelist({ ...values } as ICode)
      await codelistUtils.fetchData(true)
      setCreateCodeListModal(false)
    } catch (error: any) {
      setCreateCodeListModal(true)
      setErrorOnResponse(error.message)
    }
    setLoading(false)
  }

  const update = async (): Promise<void> => {
    await codelistUtils.fetchData(true)
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
        <Loader size="large" className="flex justify-self-center" />
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
      {loading && <Loader size="large" />}
      {!loading && (
        <div className="flex justify-between w-full">
          <Select
            label="Velg kodeverk"
            hideLabel
            className="w-full max-w-xl"
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setListname(event.target.value)}
          >
            <option value="">Velg kodeverk</option>
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
