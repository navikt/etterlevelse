import { TEtterlevelseQL } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { etterlevelseUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import { etterlevelseTeamNavnId } from '@/util/etterlevelseUtil/etterlevelseUtil'
import { BodyShort, LinkPanel, Spacer } from '@navikt/ds-react'
import moment from 'moment'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'

type TProps = {
  modalVersion?: boolean
  setOpenEtterlevelse: Dispatch<SetStateAction<TEtterlevelseQL | undefined>>
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  etterlevelse: TEtterlevelseQL
  index: number
}

export const EtterlevelseLinkPanel: FunctionComponent<TProps> = ({
  etterlevelse,
  index,
  modalVersion,
  setOpenEtterlevelse,
  setIsModalOpen,
}) => (
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
              etterlevelseDokumentasjonId: etterlevelse.etterlevelseDokumentasjon.id,
            })
            setIsModalOpen(true)
          }
        : undefined
    }
  >
    <LinkPanel.Title className='flex items-center'>
      <div>
        <BodyShort>
          <strong>E{etterlevelse.etterlevelseDokumentasjon.etterlevelseNummer}</strong>:{' '}
          {etterlevelse.etterlevelseDokumentasjon.title}
        </BodyShort>
      </div>
      <Spacer />
      <div className='w-44'>
        <BodyShort>
          {!!etterlevelse.etterlevelseDokumentasjon.teamsData &&
            !!etterlevelse.etterlevelseDokumentasjon.teamsData.length &&
            etterlevelseTeamNavnId(etterlevelse)}
        </BodyShort>
        <BodyShort>
          Utfylt: {moment(etterlevelse.changeStamp.lastModifiedDate).format('LL')}
        </BodyShort>
      </div>
    </LinkPanel.Title>
  </LinkPanel>
)
export default EtterlevelseLinkPanel
