import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { HeadingXXLarge } from 'baseui/typography'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { arkiveringMapToFormVal, arkiveringStatusToString, deleteEtterlevelseArkiv, getAllArkivering } from '../api/ArkiveringApi'
import CustomizedInput from '../components/common/CustomizedInput'
import { borderColor } from '../components/common/Style'
import { Cell, Row, Table } from '../components/common/Table'
import { Layout2 } from '../components/scaffold/Page'
import { EtterlevelseArkiv } from '../constants'
import { ampli } from '../services/Amplitude'
import { ettlevColors, maxPageWidth } from '../util/theme'

export const ArkivAdminPage = () => {
  const [arkiveringId, setArkiveringId] = useState<string>('')

  const [tableContent, setTableContent] = useState<EtterlevelseArkiv[]>([])

  useEffect(() => {

    ; (async () => {
      const arkivering = await getAllArkivering()
      const mappedArkivering = arkivering.map((a) => arkiveringMapToFormVal(a))
      setTableContent(mappedArkivering)
      ampli.logEvent('sidevisning', { side: 'Etterlevelse arkivering admin side', sidetittel: 'Administere arkivering' })
    })()
  }, [])


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
          <HeadingXXLarge marginTop="0">(WIP!!) Administere arkivering</HeadingXXLarge>
        </Block>
      }
    >
      <Block display="flex">
        <CustomizedInput
          value={arkiveringId}
          placeholder="Nåværende behandlings UID"
          onChange={(e) => { setArkiveringId(e.target.value) }}
          overrides={{
            Root: {
              style: {
                ...borderColor(ettlevColors.grey200),
                marginRight: '5px'
              },
            },
          }}
        />

        <Button
          onClick={() => {
            deleteEtterlevelseArkiv(arkiveringId).then(() => setArkiveringId(''))
          }}
        >
          Delete
        </Button>
      </Block>

      <Block>
        
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
              { title: 'Status', column: 'status' },
            ]}
            render={(tableData) => {
              return tableData.data.slice((tableData.page - 1) * tableData.limit, (tableData.page - 1) * tableData.limit + tableData.limit).map((arkivering, index) => {
                return (
                  <Row key={arkivering.id}>
                    <Cell>
                      {arkivering.id}
                    </Cell>
                    <Cell>
                      {arkiveringStatusToString(arkivering.status)}
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