import * as React from 'react'
import { useEffect } from 'react'
import { StatefulSelect } from 'baseui/select'
import { Block } from 'baseui/block'
import { KIND, SIZE as ButtonSize } from 'baseui/button'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { HeadingMedium } from 'baseui/typography'
import { Spinner } from 'baseui/spinner'
import Button from '../../common/Button'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useAwait, useForceUpdate } from '../../../util/hooks'
import { Code, codelist, CodeListFormValues } from '../../../services/Codelist'
import { createCodelist } from '../../../api/CodelistApi'
import { theme } from '../../../util'
import { user } from '../../../services/User'
import CreateCodeListModal from './ModalCreateCodeList'
import CodeListTable from './CodeListStyledTable'
import { ettlevColors, responsivePaddingSmall, responsiveWidthSmall } from '../../../util/theme'
import { Helmet } from 'react-helmet'
import { loginUrl } from '../../Header'

const CodeListPage = () => {
  const params = useParams<{ listname?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [listname, setListname] = React.useState(params.listname)
  const [createCodeListModal, setCreateCodeListModal] = React.useState(false)
  const [errorOnResponse, setErrorOnResponse] = React.useState(null)
  const forceUpdate = useForceUpdate()
  const location = useLocation()
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
    update().catch()
    if(!user.isLoggedIn()) {
      window.location.href = loginUrl(location, location.pathname)
    } if (!user.isAdmin()) {
      window.location.href = '/forbidden'
    }
  }, [])

  useEffect(() => {
    if (listname && listname !== params.listname) {
      navigate(`/admin/codelist/${listname}`, { replace: true })
    }
  }, [listname, lists])

  if (!user.isAdmin() || !lists) {
    return <Spinner $color={ettlevColors.green400} $size={theme.sizing.scale2400} />
  }

  return (
    <Block width={responsiveWidthSmall} paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{listname ? listname : ''} </title>
      </Helmet>
      <HeadingMedium>Administrering av kodeverk</HeadingMedium>
      {loading ? (
        <Spinner $color={ettlevColors.green400} />
      ) : (
        <Block display="flex" justifyContent="space-between" width="100%">
          <Block width="600px">
            <StatefulSelect
              options={codelist.makeIdLabelForAllCodeLists()}
              onChange={({ value }) => setListname(value[0].id as string)}
              clearable={false}
              placeholder="Velg kodeverk"
              initialState={{ value: listname ? [{ id: listname, label: listname }] : [] }}
            />
          </Block>
          {listname && (
            <Block>
              <Button tooltip="Legg til ny" icon={faPlus} size={ButtonSize.compact} kind={KIND.tertiary} onClick={() => setCreateCodeListModal(!createCodeListModal)}>
                Opprett ny kode
              </Button>
            </Block>
          )}
        </Block>
      )}

      {!loading && currentCodelist && (
        <Block marginTop={theme.sizing.scale600}>
          <CodeListTable tableData={currentCodelist || []} refresh={update} />
        </Block>
      )}

      <CreateCodeListModal
        title="Ny kode"
        list={listname!}
        isOpen={createCodeListModal}
        errorOnCreate={errorOnResponse}
        onClose={() => {
          setCreateCodeListModal(!createCodeListModal)
          setErrorOnResponse(null)
        }}
        submit={handleCreateCodelist}
      />
    </Block>
  )
}

export default CodeListPage
