import { TEtterlevelseQL } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { INomSeksjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import {
  filteredEtterlevelseSorted,
  seksjonerSorted,
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

const seksjonEtterlevelser = (
  seksjon: INomSeksjon,
  krav: TKravQL,
  filter: string
): TEtterlevelseQL[] => {
  const filteredEtterlevelse = filteredEtterlevelseSorted(krav, filter)

  const newFilteredEtterlevelse: TEtterlevelseQL[] = filteredEtterlevelse?.filter(
    (etterlevelse: TEtterlevelseQL) =>
      etterlevelse.etterlevelseDokumentasjon.seksjoner &&
      seksjon &&
      etterlevelse.etterlevelseDokumentasjon.seksjoner.filter(
        (seksjonItem: INomSeksjon) => seksjonItem.nomSeksjonId === seksjon.nomSeksjonId
      ).length > 0
  )

  return newFilteredEtterlevelse
}

export const EtterlevelseSeksjonFinnes: FunctionComponent<TProps> = ({
  krav,
  modalVersion,
  setOpenEtterlevelse,
  setIsModalOpen,
  filter,
}) => {
  const seksjoner: INomSeksjon[] = seksjonerSorted(krav, filter)

  return (
    <>
      {seksjoner.length > 0 && (
        <Accordion>
          {seksjoner.map((seksjon: INomSeksjon) => (
            <Accordion.Item key={seksjon.nomSeksjonId}>
              <Accordion.Header>{seksjon.nomSeksjonName}</Accordion.Header>
              <Accordion.Content>
                <div className='flex flex-col gap-2'>
                  {seksjonEtterlevelser(seksjon, krav, filter).map(
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
