import * as React from 'react'
import {useEffect} from 'react'
import {StatefulSelect} from 'baseui/select'
import {Block} from 'baseui/block'
import {KIND, SIZE as ButtonSize} from 'baseui/button'
import {useHistory, useParams} from 'react-router-dom'

import {H4} from 'baseui/typography'
import {StyledSpinnerNext} from 'baseui/spinner'
import Button from '../../common/Button'
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {useAwait, useForceUpdate} from '../../../util/hooks'
import {Code, codelist, CodeListFormValues} from '../../../services/Codelist'
import {createCodelist} from '../../../api/CodelistApi'
import {theme} from '../../../util'
import {user} from '../../../services/User'
import CreateCodeListModal from './ModalCreateCodeList'
import CodeListTable from './CodeListStyledTable'

const CodeListPage = () => {
  const params = useParams<{listname?: string}>()
  const history = useHistory()
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
      await createCodelist({...values} as Code)
      await codelist.refreshCodeLists()
      setCreateCodeListModal(false)
    } catch (error) {
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
  }, [])

  useEffect(() => {
    if (listname && listname !== params.listname) {
      history.replace(`/admin/codelist/${listname}`)
    }
  }, [listname, lists])

  if (!user.isAdmin() || !lists) {
    return <StyledSpinnerNext size={theme.sizing.scale2400}/>
  }

  return <Block width='100%'>
    <H4>Administrering av kodeverk</H4>
    {loading ? <StyledSpinnerNext/> : (
      <Block display='flex' justifyContent='space-between' width='100%'>
        <Block width='600px'>
          <StatefulSelect
            options={codelist.makeIdLabelForAllCodeLists()}
            onChange={({value}) => setListname(value[0].id as string)}
            clearable={false}
            placeholder='Velg kodeverk'
            initialState={{value: listname ? [{id: listname, label: listname}] : []}}
          />
        </Block>
        <Block>
          <Button
            tooltip='Legg til ny'
            icon={faPlus}
            size={ButtonSize.compact}
            kind={KIND.minimal}
            onClick={() => setCreateCodeListModal(!createCodeListModal)}
          >
            Opprett ny kode
          </Button>
        </Block>
      </Block>
    )}

    {!loading && currentCodelist &&
    <Block marginTop={theme.sizing.scale600}>
      <CodeListTable
        tableData={currentCodelist || []}
        refresh={update}
      />
    </Block>
    }

    <CreateCodeListModal
      title='Ny kode'
      list={listname!}
      isOpen={createCodeListModal}
      errorOnCreate={errorOnResponse}
      onClose={
        () => {
          setCreateCodeListModal(!createCodeListModal)
          setErrorOnResponse(null)
        }
      }
      submit={handleCreateCodelist}
    />
  </Block>
}

export default CodeListPage
