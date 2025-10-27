'use client'

import { getDocumentRelationByFromIdAndRelationTypeWithData } from '@/api/dokumentRelasjon/dokumentRelasjonApi'
import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { LoadingSkeleton } from '@/components/common/loadingSkeleton/loadingSkeletonComponent'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import {
  ERelationType,
  IDocumentRelationWithEtterlevelseDokumetajson,
} from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import {
  dokumentasjonBreadCrumbPath,
  dokumentasjonerBreadCrumbPath,
} from '@/util/breadCrumbPath/breadCrumbPath'
import { Heading, Link, Table } from '@navikt/ds-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export const RelasjonsOversiktPage = () => {
  const params = useParams<{ etterlevelseDokumentasjonId: string }>()

  const [etterlevelseDokumentasjon, , ,] = useEtterlevelseDokumentasjon(
    params.etterlevelseDokumentasjonId
  )
  const [dokumentRelasjonBarn, setDokumentRelasjonBarn] =
    useState<IDocumentRelationWithEtterlevelseDokumetajson[]>()

  useEffect(() => {
    if (etterlevelseDokumentasjon) {
      // ampli.logEvent('sidevisning', {
      //   side: 'Etterlevelse Dokumentasjon Page',
      //   sidetittel: `E${etterlevelseDokumentasjon.etterlevelseNummer.toString()} ${
      //     etterlevelseDokumentasjon.title
      //   }`,
      //   ...userRoleEventProp,
      // })
      ;(async () => {
        await getDocumentRelationByFromIdAndRelationTypeWithData(
          etterlevelseDokumentasjon.id,
          ERelationType.ARVER
        ).then((response) => {
          setDokumentRelasjonBarn(response)
        })
      })()
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
    dokumentasjonBreadCrumbPath(
      etterlevelseNavn,
      etterlevelseDokumentasjonIdUrl(params.etterlevelseDokumentasjonId)
    ),
  ]

  console.debug(dokumentRelasjonBarn)

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
