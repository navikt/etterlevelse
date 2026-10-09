'use client'

import { InformationSquareFillIcon } from '@navikt/aksel-icons'
import { BodyShort, Heading, Link, Skeleton } from '@navikt/ds-react'
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
        <ul
          className='mt-6 grid flex-1 gap-4 list-none p-0'
          style={{ gridTemplateRows: 'repeat(3, 1fr)' }}
        >
          {[0, 1, 2].map((index: number) => (
            <li key={index} className='flex'>
              <Skeleton variant='rounded' height='100%' width='100%' />
            </li>
          ))}
        </ul>
      )}

      {!loading && sistDokumenterte.length > 0 && (
        <ul
          className='mt-6 grid flex-1 gap-4 list-none p-0'
          style={{ gridTemplateRows: 'repeat(3, 1fr)' }}
        >
          {sistDokumenterte.map((etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => (
            <li key={etterlevelseDokumentasjon.id} className='flex'>
              <SistDokumentertCard etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
            </li>
          ))}
        </ul>
      )}

      {!loading && sistDokumenterte.length === 0 && (
        <div className='mt-6 flex items-start gap-2' id='main-page-text'>
          <InformationSquareFillIcon
            aria-hidden
            fontSize='1.5rem'
            className='shrink-0'
            style={{ color: 'var(--ax-bg-info-strong)' }}
          />
          <BodyShort>
            Vi fant ingen dokumenter du har dokumentert på de siste 6 månedene.{' '}
            <Link href={etterlevelseDokumentasjonerUrl()}>Se alle etterlevelsesdokumenter</Link>.
          </BodyShort>
        </div>
      )}
    </section>
  )
}
