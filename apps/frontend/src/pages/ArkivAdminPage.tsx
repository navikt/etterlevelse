import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { HeadingXXLarge, LabelLarge } from 'baseui/typography'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import {
  arkiveringMapToFormVal,
  arkiveringStatusToString,
  deleteEtterlevelseArkiv,
  getAllArkivering,
  getEtterlevelseArkiv,
  updateAsAdminEtterlevelseArkiv,
} from '../api/ArkiveringApi'
import CustomizedInput from '../components/common/CustomizedInput'
import { CustomizedStatefulSelect } from '../components/common/CustomizedSelect'
import RouteLink from '../components/common/RouteLink'
import { Cell, Row, Table } from '../components/common/Table'
import { Layout2 } from '../components/scaffold/Page'
import { EtterlevelseArkiv, EtterlevelseArkivStatus } from '../constants'
import { ampli } from '../services/Amplitude'
import { ettlevColors, maxPageWidth } from '../util/theme'

export const ArkivAdminPage = () => {
  const [arkiveringId, setArkiveringId] = useState<string>('')
  const [arkiveringsStatus, setArkiveringsStatus] = useState<EtterlevelseArkivStatus>()
  const [reloadTable, setReloadTable] = useState(false)
  const [tableContent, setTableContent] = useState<EtterlevelseArkiv[]>([])

  const options = [
    { label: 'Ikke arkiver', id: EtterlevelseArkivStatus.IKKE_ARKIVER },
    { label: 'Error', id: EtterlevelseArkivStatus.ERROR },
    { label: 'Arkivert', id: EtterlevelseArkivStatus.ARKIVERT },
    { label: 'Behandler arkivering', id: EtterlevelseArkivStatus.BEHANDLER_ARKIVERING },
    { label: 'Til arkivering', id: EtterlevelseArkivStatus.TIL_ARKIVERING },
  ]

  useEffect(() => {
    ;(async () => {
      const arkivering = await getAllArkivering()
      const mappedArkivering = arkivering.map((a) => arkiveringMapToFormVal(a))
      setTableContent(mappedArkivering)
      ampli.logEvent('sidevisning', { side: 'Etterlevelse arkivering admin side', sidetittel: 'Administere arkivering' })
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      const arkivering = await getAllArkivering()
      const mappedArkivering = arkivering.map((a) => arkiveringMapToFormVal(a))
      setTableContent(mappedArkivering)
    })()
  }, [reloadTable])

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey25}
      childrenBackgroundColor={ettlevColors.grey25}
      currentPage="Administere Arkivering"
      mainHeader={
        <Block maxWidth={maxPageWidth} width="100%" display={'flex'} justifyContent="flex-start">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Administere arkivering</title>
          </Helmet>
          <HeadingXXLarge marginTop="0">Administere arkivering</HeadingXXLarge>
        </Block>
      }
    >
      <Block display="flex" alignItems="center">
        <Block display="flex" width="100%">
          <Block width="100%" marginRight="5px">
            <CustomizedInput
              value={arkiveringId}
              placeholder="Arkiverings UID"
              size="compact"
              onChange={(e) => {
                setArkiveringId(e.target.value)
              }}
            />
          </Block>
          <Block width="40%">
            <CustomizedStatefulSelect
              size="compact"
              options={options}
              onChange={(status) => setArkiveringsStatus(status?.value[0]?.id as EtterlevelseArkivStatus)}
              overrides={{
                Root: {
                  style: {
                    marginRight: '5px',
                  },
                },
              }}
            />
          </Block>
        </Block>
        <Block display="flex" marginLeft="5px">
          <Button
            onClick={() => {
              deleteEtterlevelseArkiv(arkiveringId).then(() => {
                setArkiveringId('')
                setReloadTable(!reloadTable)
              })
            }}
          >
            Delete
          </Button>
          <Block marginLeft="5px" marginRight="5px">
            <Button
              onClick={() => {
                getEtterlevelseArkiv(arkiveringId).then((arkivering) => {
                  if (arkiveringsStatus) {
                    updateAsAdminEtterlevelseArkiv({
                      ...arkivering,
                      status: arkiveringsStatus,
                    }).then(() => {
                      setArkiveringId('')
                      setArkiveringsStatus(undefined)
                      setReloadTable(!reloadTable)
                    })
                  }
                })
              }}
            >
              Oppdater Status
            </Button>
          </Block>
        </Block>
      </Block>

      <Block marginTop="32px">
        <LabelLarge>Arkiv tabell</LabelLarge>
        {tableContent.length && (
          <Table
            emptyText=""
            data={tableContent}
            config={{
              pageSizes: [5, 10, 20, 50, 100],
              defaultPageSize: 20,
            }}
            headers={[
              { title: 'Arkivering ID', column: 'id' },
              { title: 'Behandling ID', column: 'behandlingId' },
              { title: 'Status', column: 'status' },
              { title: 'Bestilt Arkiverings dato', column: 'tilArkiveringDato' },
              { title: 'Arkiverings dato', column: 'arkiveringDato' },
            ]}
            render={(tableData) => {
              return tableData.data.slice((tableData.page - 1) * tableData.limit, (tableData.page - 1) * tableData.limit + tableData.limit).map((arkivering, index) => {
                return (
                  <Row key={arkivering.id}>
                    <Cell>{arkivering.id}</Cell>
                    <Cell>
                      <RouteLink href={`/behandling/${arkivering.behandlingId}`}>{arkivering.behandlingId}</RouteLink>
                    </Cell>
                    <Cell>{arkiveringStatusToString(arkivering.status)}</Cell>
                    <Cell>
                      {moment(arkivering.tilArkiveringDato).format('lll')}
                    </Cell>
                    <Cell>
                     {moment(arkivering.arkiveringDato).format('lll')}
                    </Cell>
                  </Row>
                )
              })
            }}
          />
        )}
      </Block>
    </Layout2>
  )
}
export default ArkivAdminPage
