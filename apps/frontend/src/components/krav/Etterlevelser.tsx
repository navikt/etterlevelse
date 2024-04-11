import { Accordion, BodyShort, Label, LinkPanel, Loader, Select, Spacer } from '@navikt/ds-react'
import _ from 'lodash'
import moment from 'moment'
import { useState } from 'react'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
  TEtterlevelseQL,
  TKravQL,
} from '../../constants'
import { ettlevColors } from '../../util/theme'
import { sadFolderIcon } from '../Images'
import { InfoBlock } from '../common/InfoBlock'
import EtterlevelseModal from '../etterlevelse/EtterlevelseModal'

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
      (e) =>
        e.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
        e.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
    )
    .sort((a, b) => {
      if (a.etterlevelseDokumentasjon && b.etterlevelseDokumentasjon) {
        return a.etterlevelseDokumentasjon.title.localeCompare(b.etterlevelseDokumentasjon.title)
      } else {
        return -1
      }
    })
    .filter(
      (e) => e.etterlevelseDokumentasjon && e.etterlevelseDokumentasjon.title !== 'LEGACY_DATA'
    )

  etterlevelser.map((etterlevelse) => {
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

    etterlevelse.etterlevelseDokumentasjon.teamsData &&
      etterlevelse.etterlevelseDokumentasjon.teamsData.forEach((t) => {
        if (!t.productAreaId && !t.productAreaName) {
          t.productAreaId = 'INGEN_PO'
          t.productAreaName = 'Ingen produktområde'
        }
      })
    return etterlevelse
  })

  const filteredEtterlevelse = etterlevelser.filter((e) => {
    if (filter !== 'ALLE') {
      if (filter === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) {
        return (
          e.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT ||
          e.suksesskriterieBegrunnelser.filter(
            (suksesskriterium) =>
              suksesskriterium.suksesskriterieStatus === ESuksesskriterieStatus.IKKE_RELEVANT
          ).length > 0
        )
      } else if (filter === ESuksesskriterieStatus.IKKE_OPPFYLT) {
        return (
          e.suksesskriterieBegrunnelser.filter(
            (suksesskriterium) =>
              suksesskriterium.suksesskriterieStatus === ESuksesskriterieStatus.IKKE_OPPFYLT
          ).length > 0
        )
      } else if (filter === ESuksesskriterieStatus.OPPFYLT) {
        return (
          e.suksesskriterieBegrunnelser.filter(
            (suksesskriterium) =>
              suksesskriterium.suksesskriterieStatus === ESuksesskriterieStatus.OPPFYLT
          ).length > 0
        )
      } else {
        return e.status === filter
      }
    } else {
      return (
        e.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
        e.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
      )
    }
  })

  const productAreas = _.sortedUniqBy(
    filteredEtterlevelse
      ?.map(
        (etterlevelse) =>
          etterlevelse.etterlevelseDokumentasjon.teamsData &&
          etterlevelse.etterlevelseDokumentasjon.teamsData
      )
      .flat()
      .sort((a, b) => (a?.productAreaName || '').localeCompare(b?.productAreaName || ''))
      .filter((team) => !!team) || [],
    (a) => a?.productAreaId
  )

  return (
    <div>
      {!loading && etterlevelser.length > 0 && (
        <div className="flex items-center py-5">
          <Label>Vis:</Label>
          <div className="px-4 w-72">
            <Select
              label="Velg etterlevelse filter"
              hideLabel
              value={filter}
              onChange={(params) => {
                setFilter(params.target.value)
              }}
            >
              {etterlevelseFilter.map((filter, i) => (
                <option key={i + '_' + filter.label} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}
      {loading && <Loader size="large" />}
      {!loading && !etterlevelser.length && (
        <InfoBlock
          icon={sadFolderIcon}
          alt={'Trist mappe ikon'}
          text={'Det er ikke dokumentert etterlevelse på dette kravet'}
          color={ettlevColors.red50}
        />
      )}

      {productAreas.length > 0 && (
        <Accordion>
          {productAreas.map((poTeam) => {
            const productAreaEtterlevelser = filteredEtterlevelse?.filter(
              (etterlevelse) =>
                etterlevelse.etterlevelseDokumentasjon.teamsData &&
                poTeam &&
                etterlevelse.etterlevelseDokumentasjon.teamsData.filter(
                  (team) => poTeam.productAreaId === team.productAreaId
                ).length > 0
            )

            return (
              <Accordion.Item key={poTeam && poTeam.productAreaId}>
                <Accordion.Header>
                  {poTeam
                    ? poTeam.productAreaName
                      ? poTeam.productAreaName
                      : poTeam.productAreaId
                    : ''}
                </Accordion.Header>
                <Accordion.Content>
                  <div className="flex flex-col gap-2">
                    {productAreaEtterlevelser.map((etterlevelse, index) => (
                      <LinkPanel
                        key={etterlevelse.kravNummer + '_' + index}
                        href={modalVersion ? undefined : `/etterlevelse/${etterlevelse.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
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
                        <LinkPanel.Title className="flex items-center">
                          <div>
                            <BodyShort>
                              <strong>
                                E{etterlevelse.etterlevelseDokumentasjon.etterlevelseNummer}
                              </strong>
                              : {etterlevelse.etterlevelseDokumentasjon.title}
                            </BodyShort>
                          </div>
                          <Spacer />
                          <div className="w-44">
                            <BodyShort>
                              {!!etterlevelse.etterlevelseDokumentasjon.teamsData &&
                              !!etterlevelse.etterlevelseDokumentasjon.teamsData.length
                                ? etterlevelse.etterlevelseDokumentasjon.teamsData
                                    .map((team) => (team.name ? team.name : team.id))
                                    .join(', ')
                                : 'Ingen team'}
                            </BodyShort>
                            <BodyShort>{`Utfylt: ${moment(
                              etterlevelse.changeStamp.lastModifiedDate
                            ).format('ll')}`}</BodyShort>
                          </div>
                        </LinkPanel.Title>
                      </LinkPanel>
                    ))}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            )
          })}
        </Accordion>
      )}

      {productAreas.length === 0 && (
        <div className="flex item-center">
          {etterlevelser.length >= 1 && (
            <Label>
              Ingen etterlevelser med {etterlevelseFilter.filter((ef) => ef.id === filter)[0].label}{' '}
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

export default Etterlevelser
