import { Heading, Table } from '@navikt/ds-react'
import { PageLayout } from '../components/scaffold/Page'
import { IBreadCrumbPath } from '../constants'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const MorOversiktBarnDokument = () => {
  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]

  return (
    <PageLayout pageTitle="PAGE TITLE" currentPage="CURRENT PAGE" breadcrumbPaths={breadcrumbPaths}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Heading level="1" size="medium">
            MOR HEADER CURRENT PAGE
          </Heading>
          <Table zebraStripes>
            <Table.Header>
              <Table.HeaderCell>Dokumentnavn</Table.HeaderCell>
              <Table.HeaderCell>CELLHEADING</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.DataCell>DOKUMENT LENKE</Table.DataCell>
                <Table.DataCell>CELL TEXT</Table.DataCell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      </div>
    </PageLayout>
  )
}
