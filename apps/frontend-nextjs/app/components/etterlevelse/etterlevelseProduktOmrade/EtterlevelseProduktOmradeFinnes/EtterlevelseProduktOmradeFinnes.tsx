import { TEtterlevelseQL } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { ITeam } from '@/constants/teamkatalogen/teamkatalogConstants'
import { etterlevelseUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import {
  filteredEtterlevelseSorted,
  produktOmradeSorted,
} from '@/util/etterlevelseUtil/etterlevelseUtil'
import { Accordion, BodyShort, LinkPanel, Spacer } from '@navikt/ds-react'
import moment from 'moment'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'

type TProps = {
  krav: TKravQL
  modalVersion?: boolean
  setOpenEtterlevelse: Dispatch<SetStateAction<TEtterlevelseQL | undefined>>
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  filter: string
}

export const EtterlevelseProduktOmradeFinnes: FunctionComponent<TProps> = ({
  krav,
  modalVersion,
  setOpenEtterlevelse,
  setIsModalOpen,
  filter,
}) => {
  const produktOmrade: ITeam[] = produktOmradeSorted(krav, filter)

  const filteredEtterlevelse = filteredEtterlevelseSorted(krav, filter)

  return (
    <>
      {produktOmrade.length > 0 && (
        <Accordion>
          {produktOmrade.map((produktOmradeTeam: ITeam) => {
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
                              <BodyShort>
                                Utfylt:{' '}
                                {moment(etterlevelse.changeStamp.lastModifiedDate).format('LL')}
                              </BodyShort>
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
    </>
  )
}
