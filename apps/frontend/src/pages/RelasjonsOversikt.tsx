import { Heading, Link, Table } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getDocumentRelationByFromIdAndRelationTypeWithData } from '../api/DocumentRelationApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { etterlevelseDokumentasjonIdUrl } from '../components/common/RouteLinkEtterlevelsesdokumentasjon'
import { PageLayout } from '../components/scaffold/Page'
import {
  ERelationType,
  IBreadCrumbPath,
  IDocumentRelationWithEtterlevelseDokumetajson,
} from '../constants'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { dokumentasjonBreadCrumbPath, dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const RelasjonsOversikt = () => {
  const params = useParams<{ id?: string; tema?: string }>()

  const [etterlevelseDokumentasjon, , ,] = useEtterlevelseDokumentasjon(params.id)
  const [dokumentRelasjonBarn, setDokumentRelasjonBarn] =
    useState<IDocumentRelationWithEtterlevelseDokumetajson[]>()

  useEffect(() => {
    if (etterlevelseDokumentasjon) {
      ampli.logEvent('sidevisning', {
        side: 'Etterlevelse Dokumentasjon Page',
        sidetittel: `E${etterlevelseDokumentasjon.etterlevelseNummer.toString()} ${
          etterlevelseDokumentasjon.title
        }`,
        ...userRoleEventProp,
      })

      getDocumentRelationByFromIdAndRelationTypeWithData(
        etterlevelseDokumentasjon.id,
        ERelationType.ARVER
      ).then((response) => {
        setDokumentRelasjonBarn(response)
      })
    }
  }, [etterlevelseDokumentasjon])

  if (!etterlevelseDokumentasjon) return <LoadingSkeleton header='Dokumentasjon' />

  const { etterlevelseNummer, title } = etterlevelseDokumentasjon
  const etterlevelseNavn: string = 'E' + etterlevelseNummer.toString() + ' ' + title
  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonBreadCrumbPath(
      dokumentasjonerBreadCrumbPath.pathName,
      dokumentasjonerBreadCrumbPath.href
    ),
    dokumentasjonBreadCrumbPath(etterlevelseNavn, etterlevelseDokumentasjonIdUrl(params.id)),
  ]

  return (
    <PageLayout
      pageTitle={'Dokumenter som gjenbruker ' + etterlevelseNavn}
      currentPage={'Dokumenter som gjenbruker ' + etterlevelseNavn}
      breadcrumbPaths={breadcrumbPaths}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <Heading level='1' size='medium'>
            Dokumenter som gjenbruker E{etterlevelseNummer.toString()} {title}
          </Heading>
          {dokumentRelasjonBarn && (
            <Table zebraStripes>
              <Table.Header>
                <Table.HeaderCell>Dokumentnavn</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {dokumentRelasjonBarn.map((dokument, index) => (
                  <Table.Row key={index + dokument.toDocumentWithData.etterlevelseNummer}>
                    <Table.DataCell>
                      <Link href={etterlevelseDokumentasjonIdUrl(dokument.toDocumentWithData.id)}>
                        {'E' +
                          dokument.toDocumentWithData.etterlevelseNummer.toString() +
                          ' ' +
                          dokument.toDocumentWithData.title}
                      </Link>
                    </Table.DataCell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
