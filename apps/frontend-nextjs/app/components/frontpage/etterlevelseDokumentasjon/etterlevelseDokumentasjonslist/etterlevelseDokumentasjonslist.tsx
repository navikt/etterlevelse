import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  filteredEtterlevelsesDokumentasjoner,
  sortEtterlevelseDokumentasjonerByUsersLastModifiedDate,
} from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { BodyLong, Heading, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { EtterlevelseDokumentasjonsPanel } from '../../../etterlevelseDokumentasjon/etterlevelseDokumentasjonListPage/panels/etterlevelseDokumentasjonsPanel'

type TProps = {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
}

export const EtterlevelseDokumentasjonList: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjoner,
}) => {
  const sortedEtterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[] =
    sortEtterlevelseDokumentasjonerByUsersLastModifiedDate([...etterlevelseDokumentasjoner])

  const getFilteredEtterlevelsesDokumentasjoner: TEtterlevelseDokumentasjonQL[] =
    filteredEtterlevelsesDokumentasjoner(sortedEtterlevelseDokumentasjoner)

  return (
    <div>
      <Heading size='medium' level='2'>
        Mine sist dokumenterte
      </Heading>
      {getFilteredEtterlevelsesDokumentasjoner.length !== 0 && (
        <List className='mt-6 flex flex-col gap-2'>
          {getFilteredEtterlevelsesDokumentasjoner
            .slice(0, 2)
            .map((etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL, index: number) => (
              <List.Item icon={<div />} key={`${etterlevelseDokumentasjon.title}_${index}`}>
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
      {getFilteredEtterlevelsesDokumentasjoner.length === 0 && (
        <BodyLong id='main-page-text'>
          Ingen etterlevelsesdokument som har blitt opprettet eller endret av deg de siste 6
          månedene.
        </BodyLong>
      )}
    </div>
  )
}
