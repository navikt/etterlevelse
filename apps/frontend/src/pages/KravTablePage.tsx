import {Block} from "baseui/block";
import {maxPageWidth, theme} from "../util/theme";
import CustomizedBreadcrumbs from "../components/common/CustomizedBreadcrumbs";
import {HeadingXXLarge} from "baseui/typography";
import * as React from "react";
import {useEffect, useState} from "react";
import {emptyPage, Krav, PageResponse} from "../constants";
import {ObjectType} from "../components/admin/audit/AuditTypes";
import {getKravPage} from "../api/KravApi";
import {Cell, Row, Table} from "../components/common/Table";
import {ColumnCompares} from "../util/hooks";

const kravSorting: ColumnCompares<Krav> = {
  kravNummer: (a, b) => a.kravNummer - b.kravNummer,
  navn: (a, b) => (a.navn || '').localeCompare(b.navn || ''),
  avdeling: (a, b) => (a.avdeling?.shortName || '').localeCompare(b.avdeling?.shortName || ''),
  // products: (a, b) => ((a.products.length && a.products[0].shortName) || '').localeCompare((b.products.length && b.products[0].shortName) || '')
}

export const KravTablePage = () => {

  const [tableContent, setTableContent] = useState<PageResponse<Krav>>(emptyPage)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [table, setTable] = useState<ObjectType | undefined>(undefined)

  // useEffect(() => {
  //   (async () => {
  //     setTableContent(await getKravPage(page - 1, limit))
  //   })()
  // }, [])

  useEffect(() => {
    (async () => {
      setTableContent(await getKravPage(page - 1, limit))
    })()
  }, [page, limit, table])

  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{Block: {props: {role: 'main'}}}}>
      <Block width="100%" display={'flex'} justifyContent={'center'}>
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            <CustomizedBreadcrumbs currentPage="Administere Krav"/>
            <HeadingXXLarge marginTop="0">Administere Krav</HeadingXXLarge>
          </Block>
        </Block>
      </Block>


      <Block>
        <Table
          emptyText={""}
          data={tableContent.content}
          config={{
            initialSortColumn: 'kravNummer',
            sorting: kravSorting
          }}
          headers={[
            {$style: {maxWidth: '5%'}, title: "Krav ID", column: 'kravNummer'},
            {$style: {maxWidth: '20%', minWidth:'20%'}, title: "Kravnavn", column:'navn'},
            {title: "Ansvarlig", column:'avdeling'},
            {title: "Tema"},
            {title: "Status"},
            {title: "Siste endret"},
          ]}
          render={(tableData) =>
            tableData.data.map((krav, index) => {
              const length = window.innerWidth > 1000 ? (window.innerWidth > 1200 ? 40 : 30) : 20
              const rowNum = tableContent.pageNumber * tableContent.pageSize + index + 1
              return (
                <Row key={krav.id}>
                  <Cell $style={{maxWidth: '5%'}}>
                    {krav.kravNummer}.{krav.kravVersjon}
                  </Cell>
                  <Cell $style={{maxWidth:'20%'}}>
                    {krav.navn}
                  </Cell>
                  <Cell>
                    {krav.avdeling && krav.avdeling.shortName}
                  </Cell>
                </Row>
              )
            })
          }
        />
      </Block>
      {/*<Block display={'flex'} justifyContent="center" width="100%">*/}
      {/*  <Block maxWidth={maxPageWidth} width="100%">*/}
      {/*    <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>*/}
      {/*      <Paragraph1>*/}
      {/*        Vi jobber med å få på plass nyttig statistikk og oversikter over etterlevels Har du innspill hører vi gjerne fra deg på <strong>#etterlevelse</strong>.*/}
      {/*      </Paragraph1>*/}
      {/*    </Block>*/}
      {/*  </Block>*/}
      {/*</Block>*/}
    </Block>
  )
}
