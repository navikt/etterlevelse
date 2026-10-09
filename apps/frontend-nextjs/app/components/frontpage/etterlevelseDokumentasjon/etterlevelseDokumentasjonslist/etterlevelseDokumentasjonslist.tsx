'use client'

import { Alert, BodyShort, Heading, Link, Skeleton } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { etterlevelseDokumentasjonerUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import {
  filteredEtterlevelsesDokumentasjoner,
  sortEtterlevelseDokumentasjonerByUsersLastModifiedDate,
} from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { SistDokumentertCard } from '../SistDokumentertCard'

type TProps = {
  etterlevelseDokumentasjoner?: TEtterlevelseDokumentasjonQL[]
  loading?: boolean
}

export const MineSistDokumenterte: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjoner = [],
  loading,
}) => {
  const sortedEtterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[] =
    sortEtterlevelseDokumentasjonerByUsersLastModifiedDate([...etterlevelseDokumentasjoner])

  const sistDokumenterte: TEtterlevelseDokumentasjonQL[] = filteredEtterlevelsesDokumentasjoner(
    sortedEtterlevelseDokumentasjoner
  )

  return (
    <section
      aria-labelledby='mine-sist-dokumenterte-heading'
      className='bg-blue-50 rounded-lg p-6 h-full flex flex-col'
    >
      <Heading id='mine-sist-dokumenterte-heading' size='medium' level='2'>
        Mine sist dokumenterte
      </Heading>

      {loading && (
        <ul className='mt-6 flex flex-1 flex-col gap-4 list-none p-0'>
          {[0, 1, 2].map((index: number) => (
            <li key={index} className='flex flex-1'>
              <Skeleton variant='rounded' height='100%' width='100%' />
            </li>
          ))}
        </ul>
      )}

      {!loading && sistDokumenterte.length > 0 && (
        <ul className='mt-6 flex flex-1 flex-col gap-4 list-none p-0'>
          {sistDokumenterte.map((etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => (
            <li key={etterlevelseDokumentasjon.id} className='flex flex-1'>
              <SistDokumentertCard etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
            </li>
          ))}
        </ul>
      )}

      {!loading && sistDokumenterte.length === 0 && (
        <Alert variant='info' className='mt-6' id='main-page-text'>
          <BodyShort>
            Vi fant ingen etterlevelsesdokumenter for deg de siste måneden.{' '}
            <Link href={etterlevelseDokumentasjonerUrl()}>Se alle etterlevelsesdokumenter</Link>.
          </BodyShort>
        </Alert>
      )}
    </section>
  )
}
