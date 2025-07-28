import { sadFolderIcon } from '@/components/others/images/images'
import {
  EEtterlevelseStatus,
  ISuksesskriterieBegrunnelse,
  TEtterlevelseQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { ESuksesskriterieStatus } from '@/constants/etterlevelseDokumentasjon/suksesskriterier/suksesskriterierConstant'
import { TKravQL } from '@/constants/krav/kravConstants'
import { ITeam } from '@/constants/teamkatalogen/teamkatalogConstants'
import { etterlevelseUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import { ettlevColors } from '@/util/theme/theme'
import { Accordion, BodyShort, Label, LinkPanel, Loader, Select, Spacer } from '@navikt/ds-react'
import _ from 'lodash'
import moment from 'moment'
import { ChangeEvent, useState } from 'react'
import { InfoBlock } from '../common/infoBlock/infoBlock'
import EtterlevelseModal from './etterlevelseModal/etterlevelseModal'

const etterlevelseFilter = [
  { label: 'Alle', id: 'ALLE' },
  { label: 'Oppfylt', id: ESuksesskriterieStatus.OPPFYLT },
  { label: 'Ikke relevant', id: EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT },
  { label: 'Ikke oppfylt', id: ESuksesskriterieStatus.IKKE_OPPFYLT },
]

export const Etterlevelser = ({
  loading,
  krav,
  modalVersion,
}: {
  loading: boolean
  krav: TKravQL
  modalVersion?: boolean
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [openEtterlevelse, setOpenEtterlevelse] = useState<TEtterlevelseQL>()
  const [filter, setFilter] = useState<string>('ALLE')

  const etterlevelser = (krav.etterlevelser || [])
    .filter(
      (etterlevelse: TEtterlevelseQL) =>
        etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
        etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
    )
    .sort((a, b) => {
      if (a.etterlevelseDokumentasjon && b.etterlevelseDokumentasjon) {
        return a.etterlevelseDokumentasjon.title.localeCompare(b.etterlevelseDokumentasjon.title)
      } else {
        return -1
      }
    })
    .filter(
      (etterlevelse: TEtterlevelseQL) =>
        etterlevelse.etterlevelseDokumentasjon &&
        etterlevelse.etterlevelseDokumentasjon.title !== 'LEGACY_DATA'
    )

  etterlevelser.map((etterlevelse: TEtterlevelseQL) => {
    if (
      !etterlevelse.etterlevelseDokumentasjon.teamsData ||
      etterlevelse.etterlevelseDokumentasjon.teamsData.length === 0
    ) {
      etterlevelse.etterlevelseDokumentasjon.teamsData = [
        {
          id: 'INGEN_TEAM',
          name: 'Ingen team',
          description: 'ingen',
          tags: [],
          members: [],
          productAreaId: 'INGEN_PO',
          productAreaName: 'Ingen produktområde',
        },
      ]
    }
    if (etterlevelse.etterlevelseDokumentasjon.teamsData) {
      etterlevelse.etterlevelseDokumentasjon.teamsData.forEach((teamData: ITeam) => {
        if (!teamData.productAreaId && !teamData.productAreaName) {
          teamData.productAreaId = 'INGEN_PO'
          teamData.productAreaName = 'Ingen produktområde'
        }
      })
      return etterlevelse
    }
  })

  const filteredEtterlevelse = etterlevelser.filter((etterlevelse) => {
    if (filter !== 'ALLE') {
      if (filter === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) {
        return (
          etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT ||
          etterlevelse.suksesskriterieBegrunnelser.filter(
            (suksesskriterium: ISuksesskriterieBegrunnelse) =>
              suksesskriterium.suksesskriterieStatus === ESuksesskriterieStatus.IKKE_RELEVANT
          ).length > 0
        )
      } else if (filter === ESuksesskriterieStatus.IKKE_OPPFYLT) {
        return (
          etterlevelse.suksesskriterieBegrunnelser.filter(
            (suksesskriterium: ISuksesskriterieBegrunnelse) =>
              suksesskriterium.suksesskriterieStatus === ESuksesskriterieStatus.IKKE_OPPFYLT
          ).length > 0
        )
      } else if (filter === ESuksesskriterieStatus.OPPFYLT) {
        return (
          etterlevelse.suksesskriterieBegrunnelser.filter(
            (suksesskriterium: ISuksesskriterieBegrunnelse) =>
              suksesskriterium.suksesskriterieStatus === ESuksesskriterieStatus.OPPFYLT
          ).length > 0
        )
      } else {
        return etterlevelse.status === filter
      }
    } else {
      return (
        etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
        etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
      )
    }
  })

  const productAreas: ITeam[] = _.sortedUniqBy(
    filteredEtterlevelse
      ?.map(
        (etterlevelse: TEtterlevelseQL) =>
          etterlevelse.etterlevelseDokumentasjon.teamsData &&
          etterlevelse.etterlevelseDokumentasjon.teamsData
      )
      .flat()
      .sort((a: ITeam | undefined, b: ITeam | undefined) =>
        (a?.productAreaName || '').localeCompare(b?.productAreaName || '')
      )
      .filter((team: ITeam | undefined) => !!team) || [],
    (a: ITeam) => a?.productAreaId
  )

  return (
    <div>
      {!loading && etterlevelser.length > 0 && (
        <div className='flex items-center py-5'>
          <Label>Vis:</Label>
          <div className='px-4 w-72'>
            <Select
              label='Velg etterlevelse filter'
              hideLabel
              value={filter}
              onChange={(params: ChangeEvent<HTMLSelectElement>) => {
                setFilter(params.target.value)
              }}
            >
              {etterlevelseFilter.map(
                (
                  filter: {
                    label: string
                    id: string
                  },
                  index: number
                ) => (
                  <option key={`${index}_${filter.label}`} value={filter.id}>
                    {filter.label}
                  </option>
                )
              )}
            </Select>
          </div>
        </div>
      )}
      {loading && <Loader size='large' className='flex justify-self-center' />}
      {!loading && !etterlevelser.length && (
        <InfoBlock
          icon={sadFolderIcon}
          alt='Trist mappe ikon'
          text='Det er ikke dokumentert etterlevelse på dette kravet'
          color={ettlevColors.red50}
        />
      )}

      {productAreas.length > 0 && (
        <Accordion>
          {productAreas.map((produktOmradeTeam: ITeam) => {
            const productAreaEtterlevelser: TEtterlevelseQL[] = filteredEtterlevelse?.filter(
              (etterlevelse: TEtterlevelseQL) =>
                etterlevelse.etterlevelseDokumentasjon.teamsData &&
                produktOmradeTeam &&
                etterlevelse.etterlevelseDokumentasjon.teamsData.filter(
                  (team: ITeam) => produktOmradeTeam.productAreaId === team.productAreaId
                ).length > 0
            )

            return (
              <Accordion.Item key={produktOmradeTeam && produktOmradeTeam.productAreaId}>
                <Accordion.Header>
                  {produktOmradeTeam
                    ? produktOmradeTeam.productAreaName
                      ? produktOmradeTeam.productAreaName
                      : produktOmradeTeam.productAreaId
                    : ''}
                </Accordion.Header>
                <Accordion.Content>
                  <div className='flex flex-col gap-2'>
                    {productAreaEtterlevelser.map(
                      (etterlevelse: TEtterlevelseQL, index: number) => (
                        <LinkPanel
                          key={`${etterlevelse.kravNummer}_${index}`}
                          href={modalVersion ? undefined : `${etterlevelseUrl}/${etterlevelse.id}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          onClick={
                            modalVersion
                              ? () => {
                                  setOpenEtterlevelse({
                                    ...etterlevelse,
                                    etterlevelseDokumentasjonId:
                                      etterlevelse.etterlevelseDokumentasjon.id,
                                  })
                                  setIsModalOpen(true)
                                }
                              : undefined
                          }
                        >
                          <LinkPanel.Title className='flex items-center'>
                            <div>
                              <BodyShort>
                                <strong>
                                  E{etterlevelse.etterlevelseDokumentasjon.etterlevelseNummer}
                                </strong>
                                : {etterlevelse.etterlevelseDokumentasjon.title}
                              </BodyShort>
                            </div>
                            <Spacer />
                            <div className='w-44'>
                              <BodyShort>
                                {!!etterlevelse.etterlevelseDokumentasjon.teamsData &&
                                !!etterlevelse.etterlevelseDokumentasjon.teamsData.length
                                  ? etterlevelse.etterlevelseDokumentasjon.teamsData
                                      .map((team: ITeam) => (team.name ? team.name : team.id))
                                      .join(', ')
                                  : 'Ingen team'}
                              </BodyShort>
                              <BodyShort>{`Utfylt: ${moment(
                                etterlevelse.changeStamp.lastModifiedDate
                              ).format('LL')}`}</BodyShort>
                            </div>
                          </LinkPanel.Title>
                        </LinkPanel>
                      )
                    )}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            )
          })}
        </Accordion>
      )}

      {productAreas.length === 0 && (
        <div className='flex item-center'>
          {etterlevelser.length >= 1 && (
            <Label>
              Ingen etterlevelser med{' '}
              {
                etterlevelseFilter.filter(
                  (etterlevelse: { label: string; id: string }) => etterlevelse.id === filter
                )[0].label
              }{' '}
              status
            </Label>
          )}
        </div>
      )}

      {modalVersion && openEtterlevelse && krav && (
        <EtterlevelseModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          etterlevelse={openEtterlevelse}
          kravData={krav}
        />
      )}
    </div>
  )
}
