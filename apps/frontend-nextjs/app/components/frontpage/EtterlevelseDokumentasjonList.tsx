'use client'

import { EtterlevelseDokumentasjonsPanel } from '@/components/etterlevelse/etterlevelseDokumentasjon/EtterlevelseDokumentasjonsPanel'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { getNumberOfMonthsBetween } from '@/util/dates/checkAge'
import { sortEtterlevelseDokumentasjonerByUsersLastModifiedDate } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { BodyLong, Heading, List } from '@navikt/ds-react'

export const EtterlevelseDokumentasjonList = ({
  etterlevelseDokumentasjoner,
}: {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
}) => {
  const sortedEtterlevelseDokumentasjoner = sortEtterlevelseDokumentasjonerByUsersLastModifiedDate([
    ...etterlevelseDokumentasjoner,
  ])

  const today = new Date()

  const filteredEtterlevelsesDokumentasjoner = sortedEtterlevelseDokumentasjoner
    .filter((etterlevelseDokumentasjon) => {
      let monthAge
      if (etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg) {
        monthAge = getNumberOfMonthsBetween(
          etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg,
          today
        )
      } else {
        monthAge = getNumberOfMonthsBetween(
          etterlevelseDokumentasjon.changeStamp.createdDate || '',
          today
        )
      }
      return monthAge <= 6
    })
    .slice(0, 2)

  return (
    <div>
      <Heading size='medium' level='2'>
        Mine sist dokumenterte
      </Heading>
      {filteredEtterlevelsesDokumentasjoner.length !== 0 && (
        <List className='mt-6 flex flex-col gap-2'>
          {filteredEtterlevelsesDokumentasjoner
            .slice(0, 2)
            .map((etterlevelseDokumentasjon, index) => (
              <List.Item icon={<div />} key={etterlevelseDokumentasjon.title + '_' + index}>
                <EtterlevelseDokumentasjonsPanel
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                  onClick={() => {
                    // ampli.logEvent('navigere', {
                    //   app: 'etterlevelse',
                    //   kilde: 'forside-panel',
                    //   til: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id),
                    //   fra: '/',
                    // })
                  }}
                />
              </List.Item>
            ))}
        </List>
      )}
      {filteredEtterlevelsesDokumentasjoner.length === 0 && (
        <BodyLong id='main-page-text'>
          Ingen etterlevelsesdokument som har blitt opprettet eller endret av deg de siste 6
          månedene.
        </BodyLong>
      )}
    </div>
  )
}
