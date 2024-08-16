import { useQuery } from '@apollo/client'
import { Heading, Table } from '@navikt/ds-react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { PageLayout } from '../components/scaffold/Page'
import { IBreadCrumbPath, IEtterlevelseDokumentasjonStats, IPageResponse } from '../constants'
import { getEtterlevelseDokumentasjonStatsQuery } from '../query/EtterlevelseDokumentasjonQuery'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { dokumentasjonBreadCrumbPath, dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const MorOversiktBarnDokument = () => {
  const params = useParams<{ id?: string; tema?: string }>()
  const variables = { etterlevelseDokumentasjonId: params.id }

  const [etterlevelseDokumentasjon, , ,] = useEtterlevelseDokumentasjon(params.id)

  const { refetch: refetchRelevanteData } = useQuery<{
    etterlevelseDokumentasjon: IPageResponse<{ stats: IEtterlevelseDokumentasjonStats }>
  }>(getEtterlevelseDokumentasjonStatsQuery, {
    variables,
    skip: !params.id,
  })

  useEffect(() => {
    setTimeout(() => refetchRelevanteData(), 200)
    if (etterlevelseDokumentasjon) {
      ampli.logEvent('sidevisning', {
        side: 'Etterlevelse Dokumentasjon Page',
        sidetittel: `E${etterlevelseDokumentasjon.etterlevelseNummer.toString()} ${
          etterlevelseDokumentasjon.title
        }`,
        ...userRoleEventProp,
      })
    }
  }, [etterlevelseDokumentasjon])

  if (!etterlevelseDokumentasjon) return <LoadingSkeleton header="Dokumentasjon" />

  const { etterlevelseNummer, title } = etterlevelseDokumentasjon
  const etterlevelseNavn: string = 'E' + etterlevelseNummer.toString() + ' ' + title
  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonBreadCrumbPath(
      dokumentasjonerBreadCrumbPath.pathName,
      dokumentasjonerBreadCrumbPath.href
    ),
    dokumentasjonBreadCrumbPath(etterlevelseNavn, `/dokumentasjon/${params.id}`),
  ]

  return (
    <PageLayout
      pageTitle={'Dokumenter som gjenbruker ' + etterlevelseNavn}
      currentPage={'Dokumenter som gjenbruker ' + etterlevelseNavn}
      breadcrumbPaths={breadcrumbPaths}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Heading level="1" size="medium">
            Dokumenter som gjenbruker E{etterlevelseNummer.toString()} {title}
          </Heading>
          <Table zebraStripes>
            <Table.Header>
              <Table.HeaderCell>Dokumentnavn</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.DataCell>DOKUMENT LENKE</Table.DataCell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      </div>
    </PageLayout>
  )
}
