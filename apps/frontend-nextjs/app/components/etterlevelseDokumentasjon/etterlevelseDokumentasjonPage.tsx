'use client'

import { getDocumentRelationByToIdAndRelationTypeWithData } from '@/api/dokumentRelasjon/dokumentRelasjonApi'
import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import {
  ERelationType,
  IDocumentRelationWithEtterlevelseDokumetajson,
} from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { BodyShort, Heading, Link } from '@navikt/ds-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoadingSkeleton } from '../common/loadingSkeleton/loadingSkeletonComponent'
import { ContentLayout } from '../others/layout/content/content'
import { PageLayout } from '../others/scaffold/scaffold'
import { GjenbrukAlert } from './alert/GjenbrukAlert'
import EtterlevelseDokumentasjonExpansionCard from './expantionCard/etterlevelseDokumentasjonExpansionCard'

export const EtterlevelseDokumentasjonPage = () => {
  const params: Readonly<{
    id?: string
  }> = useParams<{ id?: string }>()
  const [etterlevelseNummer, setEtterlevelseNummer] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [morDokumentRelasjon, setMorDokumentRelasjon] =
    useState<IDocumentRelationWithEtterlevelseDokumetajson>()
  const [relasjonLoading, setRelasjonLoading] = useState(false)
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)

  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]

  useEffect(() => {
    if (etterlevelseDokumentasjon) {
      setEtterlevelseNummer(etterlevelseDokumentasjon.etterlevelseNummer.toString())
      setTitle(etterlevelseDokumentasjon.title)
      ;(async () => {
        setRelasjonLoading(true)
        await getDocumentRelationByToIdAndRelationTypeWithData(
          etterlevelseDokumentasjon?.id,
          ERelationType.ARVER
        ).then((response: IDocumentRelationWithEtterlevelseDokumetajson[]) => {
          if (response.length > 0) setMorDokumentRelasjon(response[0])
          setRelasjonLoading(false)
        })
      })()
    }
  }, [etterlevelseDokumentasjon])

  return (
    <>
      {!etterlevelseDokumentasjon && <LoadingSkeleton header='Dokumentasjon' />}
      {etterlevelseDokumentasjon && (
        <PageLayout
          pageTitle={'E' + etterlevelseNummer.toString() + ' ' + title}
          currentPage={'E' + etterlevelseNummer.toString() + ' ' + title}
          breadcrumbPaths={breadcrumbPaths}
        >
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <Heading level='1' size='medium' className='max-w-[75ch]'>
                E{etterlevelseNummer.toString()} {title}
              </Heading>

              {morDokumentRelasjon && (
                <BodyShort className='my-5'>
                  Dette dokumentet er et arv fra{' '}
                  <Link
                    href={etterlevelseDokumentasjonIdUrl(
                      morDokumentRelasjon.fromDocumentWithData.id
                    )}
                  >
                    E{morDokumentRelasjon.fromDocumentWithData.etterlevelseNummer}{' '}
                    {morDokumentRelasjon.fromDocumentWithData.title}
                  </Link>
                  .
                </BodyShort>
              )}

              <ContentLayout>
                <div className='max-w-5xl flex-1'>
                  {etterlevelseDokumentasjon.forGjenbruk &&
                    !etterlevelseDokumentasjon.tilgjengeligForGjenbruk && <GjenbrukAlert />}

                  <div className='flex mb-5'>
                    <EtterlevelseDokumentasjonExpansionCard
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      relasjonLoading={relasjonLoading}
                    />
                  </div>
                </div>
              </ContentLayout>
            </div>
          </div>
        </PageLayout>
      )}
    </>
  )
}
