import { Block } from "baseui/block";
import { ettlevColors, maxPageWidth, theme } from "../util/theme";
import { HeadingXXLarge } from "baseui/typography";
import * as React from "react";
import { useEffect, useState } from "react";
import { emptyPage, Krav, PageResponse } from "../constants";
import { getKravPage, kravMapToFormVal } from "../api/KravApi";
import { Cell, Row, Table } from "../components/common/Table";
import { ColumnCompares } from "../util/hooks";
import moment from "moment";
import { PLACEMENT, StatefulPopover } from "baseui/popover";
import { StatefulMenu } from "baseui/menu";
import { Button, KIND } from "baseui/button";
import { TriangleDown } from "baseui/icon";
import { intl } from "../util/intl/intl";
import { Pagination } from "baseui/pagination";
import { codelist, ListName } from "../services/Codelist";
import { kravStatus } from "./KravPage";
import { Layout2 } from "../components/scaffold/Page";

const kravSorting: ColumnCompares<Krav> = {
  kravNummer: (a, b) => a.kravNummer - b.kravNummer,
  navn: (a, b) => (a.navn || '').localeCompare(b.navn || ''),
  avdeling: (a, b) => (a.avdeling?.shortName || '').localeCompare(b.avdeling?.shortName || ''),
  tema: (a, b) => (codelist.getCode(ListName.TEMA, a.tema)?.shortName || '').localeCompare(codelist.getCode(ListName.TEMA, b.tema)?.shortName || ''),
  status: (a, b) => ((a.status) || '').localeCompare((b.status) || ''),
  changeStamp: (a, b) => ((a.changeStamp.lastModifiedDate) || '').localeCompare((b.changeStamp.lastModifiedDate) || ''),
}

export const KravTablePage = () => {

  const [tableContent, setTableContent] = useState<PageResponse<Krav>>(emptyPage)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) {
      return
    }
    if (nextPage > tableContent.pages) {
      return
    }
    setPage(nextPage)
  }

  useEffect(() => {
    (async () => {
      const kraver = await getKravPage(page - 1, limit)
      const mappedKraver = kraver.content.map(k => kravMapToFormVal(k))
      setTableContent({ ...kraver, content: mappedKraver })
    })()
  }, [page, limit])

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey25}
      childrenBackgroundColor={ettlevColors.grey25}
      currentPage="Administere Krav"
      mainHeader={
        <Block maxWidth={maxPageWidth} width="100%" display={'flex'} justifyContent="flex-start">
          <HeadingXXLarge marginTop="0">Administere Krav</HeadingXXLarge>
        </Block>
      }
    >
      <Block>
        <Table
          emptyText=""
          data={tableContent.content}
          config={{
            initialSortColumn: 'kravNummer',
            sorting: kravSorting
          }}
          headers={[
            { $style: { maxWidth: '5%' }, title: "Krav ID", column: 'kravNummer' },
            { $style: { maxWidth: '20%', minWidth: '20%' }, title: "Kravnavn", column: 'navn' },
            { title: "Ansvarlig", column: 'avdeling' },
            { title: "Tema", column: 'tema' },
            { title: "Status", column: 'status' },
            { title: "Siste endret", column: 'changeStamp' },
          ]}
          render={(tableData) =>
            tableData.data.map((krav, index) => {
              const length = window.innerWidth > 1000 ? (window.innerWidth > 1200 ? 40 : 30) : 20
              const rowNum = tableContent.pageNumber * tableContent.pageSize + index + 1
              return (
                <Row key={krav.id}>
                  <Cell $style={{ maxWidth: '5%' }}>
                    {krav.kravNummer}.{krav.kravVersjon}
                  </Cell>
                  <Cell $style={{ maxWidth: '20%', minWidth: '20%' }}>
                    {krav.navn}
                  </Cell>
                  <Cell>
                    {krav.avdeling && krav.avdeling.shortName}
                  </Cell>
                  <Cell>
                    {codelist.getCode(ListName.TEMA, krav.tema)?.shortName}
                  </Cell>
                  <Cell>
                    {kravStatus(krav.status)}
                  </Cell>
                  <Cell>
                    {moment(krav.changeStamp.lastModifiedDate).format('ll')}
                  </Cell>
                </Row>
              )
            })
          }
        />
      </Block>
      <Block display="flex" justifyContent="space-between" marginTop="1rem" marginBottom="40px">
        <StatefulPopover
          content={({ close }) => (
            <StatefulMenu
              items={[5, 10, 20, 50, 100].map((i) => ({ label: i }))}
              onItemSelect={({ item }) => {
                setLimit(item.label)
                close()
              }}
              overrides={{
                List: {
                  style: { height: '150px', width: '100px' },
                },
              }}
            />
          )}
          placement={PLACEMENT.bottom}
        >
          <Button kind={KIND.tertiary} endEnhancer={TriangleDown}>
            <strong>{`${limit} ${intl.rows}`}</strong>
          </Button>
        </StatefulPopover>
        <Pagination
          currentPage={page}
          numPages={tableContent.pages}
          onPageChange={({ nextPage }) => handlePageChange(nextPage)}
          labels={{ nextButton: intl.nextButton, prevButton: intl.prevButton }}
        />
      </Block>
    </Layout2>
  )
}
