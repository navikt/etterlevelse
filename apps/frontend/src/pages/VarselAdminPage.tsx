import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { HeadingXXLarge, LabelLarge } from 'baseui/typography'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import CustomizedInput from '../components/common/CustomizedInput'
import { Cell, Row, Table } from '../components/common/Table'
import { Layout2 } from '../components/scaffold/Page'
import { Melding } from '../constants'
import { ampli } from '../services/Amplitude'
import { ettlevColors, maxPageWidth } from '../util/theme'
import { deleteMelding, getAllMelding, mapMeldingToFormValue, meldingStatusToString, meldingTypeToString } from '../api/MeldingApi'

export const VarselAdminPage = () => {
  const [meldingId, setMeldinglId] = useState<string>('')
  const [reloadTable, setReloadTable] = useState(false)
  const [tableContent, setTableContent] = useState<Melding[]>([])

  useEffect(() => {
    ;(async () => {
      const melding = await getAllMelding()
      const mappedMelding = melding.map((m) => mapMeldingToFormValue(m))
      setTableContent(mappedMelding)
      ampli.logEvent('sidevisning', { side: 'Etterlevelse melding admin side', sidetittel: 'Administrere meldinger' })
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      const melding = await getAllMelding()
      const mappedMelding = melding.map((m) => mapMeldingToFormValue(m))
      setTableContent(mappedMelding)
    })()
  }, [reloadTable])

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey25}
      childrenBackgroundColor={ettlevColors.grey25}
      currentPage="Administrere Arkivering"
      mainHeader={
        <Block maxWidth={maxPageWidth} width="100%" display={'flex'} justifyContent="flex-start">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Administrere arkivering</title>
          </Helmet>
          <HeadingXXLarge marginTop="0">Administrere arkivering</HeadingXXLarge>
        </Block>
      }
    >
      <Block display="flex" alignItems="center">
        <Block display="flex" width="100%">
          <Block width="100%" marginRight="5px">
            <CustomizedInput
              value={meldingId}
              placeholder="Arkiverings UID"
              size="compact"
              onChange={(e) => {
                setMeldinglId(e.target.value)
              }}
            />
          </Block>
        </Block>
        <Block display="flex" marginLeft="5px">
          <Button
            onClick={() => {
              deleteMelding(meldingId).then(() => {
                setMeldinglId('')
                setReloadTable(!reloadTable)
              })
            }}
          >
            Delete
          </Button>
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
              { title: 'melding ID', column: 'id' },
              { title: 'status', column: 'meldingStatus' },
              { title: 'type', column: 'meldingType' },
            ]}
            render={(tableData) => {
              return tableData.data.slice((tableData.page - 1) * tableData.limit, (tableData.page - 1) * tableData.limit + tableData.limit).map((melding, index) => {
                return (
                  <Row key={melding.id}>
                    <Cell>{melding.id}</Cell>
                    <Cell>{meldingStatusToString(melding.meldingStatus)}</Cell>
                    <Cell>{meldingTypeToString(melding.meldingType)}</Cell>
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
export default VarselAdminPage
