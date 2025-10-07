import { TEtterlevelseQL } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { ITeam } from '@/constants/teamkatalogen/teamkatalogConstants'
import {
  filteredEtterlevelseSorted,
  produktOmradeSorted,
} from '@/util/etterlevelseUtil/etterlevelseUtil'
import { Accordion } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import EtterlevelseLinkPanel from './etterlevelseLinkPanel/EtterlevelseLinkPanel'

type TProps = {
  krav: TKravQL
  modalVersion?: boolean
  setOpenEtterlevelse: Dispatch<SetStateAction<TEtterlevelseQL | undefined>>
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  filter: string
}

const getProduktOmrade = (produktOmradeTeam: ITeam) => {
  if (produktOmradeTeam.productAreaName) {
    return produktOmradeTeam.productAreaName
  } else if (produktOmradeTeam.productAreaId) {
    return produktOmradeTeam.productAreaId
  } else {
    return ''
  }
}

const produktOmradeEtterlevelser = (
  produktOmradeTeam: ITeam,
  krav: TKravQL,
  filter: string
): TEtterlevelseQL[] => {
  const filteredEtterlevelse = filteredEtterlevelseSorted(krav, filter)

  const newFilteredEtterlevelse: TEtterlevelseQL[] = filteredEtterlevelse?.filter(
    (etterlevelse: TEtterlevelseQL) =>
      etterlevelse.etterlevelseDokumentasjon.teamsData &&
      produktOmradeTeam &&
      etterlevelse.etterlevelseDokumentasjon.teamsData.filter(
        (team: ITeam) => produktOmradeTeam.productAreaId === team.productAreaId
      ).length > 0
  )

  return newFilteredEtterlevelse
}

export const EtterlevelseProduktOmradeFinnes: FunctionComponent<TProps> = ({
  krav,
  modalVersion,
  setOpenEtterlevelse,
  setIsModalOpen,
  filter,
}) => {
  const produktOmrade: ITeam[] = produktOmradeSorted(krav, filter)

  return (
    <>
      {produktOmrade.length > 0 && (
        <Accordion>
          {produktOmrade.map((produktOmradeTeam: ITeam) => (
            <Accordion.Item key={produktOmradeTeam && produktOmradeTeam.productAreaId}>
              <Accordion.Header>{getProduktOmrade(produktOmradeTeam)}</Accordion.Header>
              <Accordion.Content>
                <div className='flex flex-col gap-2'>
                  {produktOmradeEtterlevelser(produktOmradeTeam, krav, filter).map(
                    (etterlevelse: TEtterlevelseQL, index: number) => (
                      <EtterlevelseLinkPanel
                        key={`${etterlevelse}-${index}`}
                        etterlevelse={etterlevelse}
                        index={index}
                        modalVersion={modalVersion}
                        setOpenEtterlevelse={setOpenEtterlevelse}
                        setIsModalOpen={setIsModalOpen}
                      />
                    )
                  )}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </>
  )
}
