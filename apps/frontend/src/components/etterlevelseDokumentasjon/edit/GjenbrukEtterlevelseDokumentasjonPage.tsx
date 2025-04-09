import { Alert, Heading, Label, Loader } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getDocumentRelationByToIdAndRelationType } from '../../../api/DocumentRelationApi'
import { useEtterlevelseDokumentasjon } from '../../../api/EtterlevelseDokumentasjonApi'
import { ERelationType } from '../../../constants'
import { Markdown } from '../../common/Markdown'
import {
  etterlevelseDokumentasjonUrl,
  etterlevelseDokumentasjonerUrl,
} from '../../common/RouteLinkEtterlevelsesdokumentasjon'
import { PageLayout } from '../../scaffold/Page'
import GjenbrukEtterlevelseDokumentasjonForm from './GjenbrukEtterlevelseDokumentasjonForm'

export const GjenbrukEtterlevelseDokumentasjonPage = () => {
  const params = useParams<{ id?: string }>()

  const [etterlevelseDokumentasjon, , isLoading] = useEtterlevelseDokumentasjon(params.id)
  const [isInheritingFrom, setIsInheritingFrom] = useState(true)

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon) {
        await getDocumentRelationByToIdAndRelationType(
          etterlevelseDokumentasjon?.id,
          ERelationType.ARVER
        ).then((resp) => {
          console.debug(resp)
          if (resp.length === 0) {
            setIsInheritingFrom(false)
          }
        })
      }
    })()
  }, [etterlevelseDokumentasjon])

  return (
    <>
      {isLoading && (
        <div className='flex w-full justify-center items-center mt-5'>
          <Loader size='3xlarge' className='flex justify-self-center' />
        </div>
      )}
      {!isLoading && etterlevelseDokumentasjon && (
        <PageLayout
          pageTitle='Gjenbruk etterlevelsesdokumentet'
          currentPage='Gjenbruk etterlevelsesdokumentet'
          breadcrumbPaths={[
            {
              href: etterlevelseDokumentasjonerUrl(),
              pathName: 'Dokumentere etterlevelse',
            },
            {
              href: etterlevelseDokumentasjonUrl(params.id),
              pathName: `E${etterlevelseDokumentasjon.etterlevelseNummer} ${etterlevelseDokumentasjon.title}`,
            },
          ]}
        >
          <Heading size='medium' level='1' spacing>
            Gjenbruk E{etterlevelseDokumentasjon.etterlevelseNummer}{' '}
            {etterlevelseDokumentasjon.title}
          </Heading>

          {etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
            <div>
              <Alert variant='info' className='mb-5'>
                <Label>Dette må du vite om gjenbruk</Label>

                <div className='mb-5'>
                  <Markdown source={etterlevelseDokumentasjon.gjenbrukBeskrivelse} />
                </div>
              </Alert>

              <GjenbrukEtterlevelseDokumentasjonForm
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                isInheritingFrom={isInheritingFrom}
              />
            </div>
          )}

          {!etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
            <div className='flex w-full justify-center'>
              <div className='flex items-center flex-col gap-5'>
                <Alert variant='warning'>
                  Denne etterlevelsesdokumentasjon er ikke tilgjengelig for gjenbruk
                </Alert>

                <img
                  src='https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaW01emp2bzZ1OWZlOWlyOHY4YmxncXQ0ZG9jZ2x0dWg0bGw1eGdvOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6Q2KA5ly49368/giphy.webp'
                  alt='no no no'
                  width='400px'
                />
              </div>
            </div>
          )}
        </PageLayout>
      )}
    </>
  )
}

export default GjenbrukEtterlevelseDokumentasjonPage
