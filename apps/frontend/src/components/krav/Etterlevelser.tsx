import { Accordion, BodyShort, Label, LinkPanel, Loader, Select, Spacer } from '@navikt/ds-react'
import _ from 'lodash'
import moment from 'moment'
import { useState } from 'react'
import { EtterlevelseQL, EtterlevelseStatus, KravQL, SuksesskriterieStatus } from '../../constants'
import { ettlevColors } from '../../util/theme'
import { sadFolderIcon } from '../Images'
import { InfoBlock } from '../common/InfoBlock'
import EtterlevelseModal from '../etterlevelse/EtterlevelseModal'

const etterlevelseFilter = [
  { label: 'Alle', id: 'ALLE' },
  { label: 'Oppfylt', id: SuksesskriterieStatus.OPPFYLT },
  { label: 'Ikke relevant', id: EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT },
  { label: 'Ikke oppfylt', id: SuksesskriterieStatus.IKKE_OPPFYLT },
]

export const Etterlevelser = ({ loading, krav, modalVersion }: { loading: boolean; krav: KravQL; modalVersion?: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [openEtterlevelse, setOpenEtterlevelse] = useState<EtterlevelseQL>()
  const [filter, setFilter] = useState<string>('ALLE')

  const etterlevelser = (krav.etterlevelser || [])
    .filter((e) => e.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || e.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT)
    .sort((a, b) => {
      if (a.etterlevelseDokumentasjon && b.etterlevelseDokumentasjon) {
        return a.etterlevelseDokumentasjon.title.localeCompare(b.etterlevelseDokumentasjon.title)
      } else {
        return -1
      }
    })
    .filter((e) => e.etterlevelseDokumentasjon && e.etterlevelseDokumentasjon.title !== 'LEGACY_DATA')

  etterlevelser.map((e) => {
    if (!e.etterlevelseDokumentasjon.teamsData || e.etterlevelseDokumentasjon.teamsData.length === 0) {
      e.etterlevelseDokumentasjon.teamsData = [
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

    e.etterlevelseDokumentasjon.teamsData &&
      e.etterlevelseDokumentasjon.teamsData.forEach((t) => {
        if (!t.productAreaId && !t.productAreaName) {
          t.productAreaId = 'INGEN_PO'
          t.productAreaName = 'Ingen produktområde'
        }
      })
    return e
  })

  const filteredEtterlevelse = etterlevelser.filter((e) => {
    if (filter !== 'ALLE') {
      if (filter === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) {
        return (
          e.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT ||
          e.suksesskriterieBegrunnelser.filter((s) => s.suksesskriterieStatus === SuksesskriterieStatus.IKKE_RELEVANT).length > 0
        )
      } else if (filter === SuksesskriterieStatus.IKKE_OPPFYLT) {
        return e.suksesskriterieBegrunnelser.filter((s) => s.suksesskriterieStatus === SuksesskriterieStatus.IKKE_OPPFYLT).length > 0
      } else if (filter === SuksesskriterieStatus.OPPFYLT) {
        return e.suksesskriterieBegrunnelser.filter((s) => s.suksesskriterieStatus === SuksesskriterieStatus.OPPFYLT).length > 0
      } else {
        return e.status === filter
      }
    } else {
      return e.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || e.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
    }
  })

  const productAreas = _.sortedUniqBy(
    filteredEtterlevelse
      ?.map((e) => e.etterlevelseDokumentasjon.teamsData && e.etterlevelseDokumentasjon.teamsData)
      .flat()
      .sort((a, b) => (a?.productAreaName || '').localeCompare(b?.productAreaName || ''))
      .filter((team) => !!team) || [],
    (a) => a?.productAreaId,
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
              {etterlevelseFilter.map((ef, i) => (
                <option key={i + '_' + ef.label} value={ef.id}>
                  {ef.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}
      {loading && <Loader size="large" />}
      {!loading && !etterlevelser.length && (
        <InfoBlock icon={sadFolderIcon} alt={'Trist mappe ikon'} text={'Det er ikke dokumentert etterlevelse på dette kravet'} color={ettlevColors.red50} />
      )}

      {productAreas.length > 0 && (
        <Accordion>
          {productAreas.map((t) => {
            const productAreaEtterlevelser = filteredEtterlevelse?.filter(
              (e) => e.etterlevelseDokumentasjon.teamsData && t && e.etterlevelseDokumentasjon.teamsData.filter((team) => team.productAreaId === t.productAreaId).length > 0,
            )

            return (
              <Accordion.Item key={t && t.productAreaId}>
                <Accordion.Header>{t ? (t.productAreaName ? t.productAreaName : t.productAreaId) : ''}</Accordion.Header>
                <Accordion.Content>
                  <div className="flex flex-col gap-2">
                    {productAreaEtterlevelser.map((e, i) => (
                      <LinkPanel
                        key={e.kravNummer + '_' + i}
                        href={modalVersion ? undefined : `/etterlevelse/${e.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={
                          modalVersion
                            ? () => {
                              setOpenEtterlevelse({ ...e, etterlevelseDokumentasjonId: e.etterlevelseDokumentasjon.id })
                              setIsModalOpen(true)
                            }
                            : undefined
                        }
                      >
                        <LinkPanel.Title className="flex items-center">
                          <div>
                            <BodyShort>
                              <strong>E{e.etterlevelseDokumentasjon.etterlevelseNummer}</strong>: {e.etterlevelseDokumentasjon.title}
                            </BodyShort>
                          </div>
                          <Spacer />
                          <div className="w-44">
                            <BodyShort>
                              {!!e.etterlevelseDokumentasjon.teamsData && !!e.etterlevelseDokumentasjon.teamsData.length
                                ? e.etterlevelseDokumentasjon.teamsData.map((t) => (t.name ? t.name : t.id)).join(', ')
                                : 'Ingen team'}
                            </BodyShort>
                            <BodyShort>{`Utfylt: ${moment(e.changeStamp.lastModifiedDate).format('ll')}`}</BodyShort>
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
          {etterlevelser.length >= 1 && <Label>Ingen etterlevelser med {etterlevelseFilter.filter((ef) => ef.id === filter)[0].label} status</Label>}
        </div>
      )}

      {modalVersion && openEtterlevelse && krav && <EtterlevelseModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} etterlevelse={openEtterlevelse} kravData={krav} />}
    </div>
  )
}

export default Etterlevelser
