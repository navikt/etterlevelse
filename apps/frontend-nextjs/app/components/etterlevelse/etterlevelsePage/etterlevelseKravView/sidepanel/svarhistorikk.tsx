'use client'

import { InformationSquareIcon } from '@navikt/aksel-icons'
import {
  BodyShort,
  Box,
  CopyButton,
  InfoCard,
  InlineMessage,
  Label,
  ReadMore,
  Tag,
} from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { Markdown } from '@/components/common/markdown/markdown'
import {
  ESuksesskriterieStatus,
  IEtterlevelse,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { IKrav, ISuksesskriterie } from '@/constants/krav/kravConstants'
import {
  getLabelForSuksessKriterie,
  getSuksesskriterieBegrunnelse,
} from '@/util/etterlevelseUtil/etterlevelseUtil'
import SuksesskriterieEndringTag from '../../suksesskriterieEndringTag'

type TProps = {
  forrigeKrav: IKrav
  forrigeEtterlevelse: IEtterlevelse
  gjeldendeSuksesskriterier: ISuksesskriterie[]
  versjonerUtenDokumentasjon: number[]
}

const StatusTag: FunctionComponent<{ status?: ESuksesskriterieStatus }> = ({ status }) => {
  switch (status) {
    case ESuksesskriterieStatus.UNDER_ARBEID:
      return (
        <Tag size='small' variant='outline' data-color='info'>
          Under arbeid
        </Tag>
      )
    case ESuksesskriterieStatus.OPPFYLT:
      return (
        <Tag size='small' variant='outline' data-color='success'>
          Oppfylt
        </Tag>
      )
    case ESuksesskriterieStatus.IKKE_OPPFYLT:
      return (
        <Tag size='small' variant='outline' data-color='danger'>
          Ikke oppfylt
        </Tag>
      )
    case ESuksesskriterieStatus.IKKE_RELEVANT:
      return (
        <Tag size='small' variant='outline' data-color='brand-beige'>
          Ikke relevant
        </Tag>
      )
    default:
      return (
        <Tag size='small' variant='outline' data-color='neutral'>
          Ikke påbegynt
        </Tag>
      )
  }
}

const InfoMelding: FunctionComponent<{ tekst: string }> = ({ tekst }) => (
  <InfoCard data-color='info' size='small'>
    <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
      <InfoCard.Title>{tekst}</InfoCard.Title>
    </InfoCard.Header>
  </InfoCard>
)

const Svarhistorikk: FunctionComponent<TProps> = ({
  forrigeKrav,
  forrigeEtterlevelse,
  gjeldendeSuksesskriterier,
  versjonerUtenDokumentasjon,
}) => {
  const gjeldendeIds = gjeldendeSuksesskriterier.map((kriterie) => kriterie.id)
  const { lastModifiedBy, lastModifiedDate } = forrigeEtterlevelse.changeStamp
  const forrigeKravNavn = `K${forrigeKrav.kravNummer}.${forrigeKrav.kravVersjon}`
  const manglendeVersjoner = versjonerUtenDokumentasjon
    .map((versjon) => `K${forrigeKrav.kravNummer}.${versjon}`)
    .join(', ')

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-3 flex-wrap'>
        <Tag size='small' variant='outline' data-color='neutral'>
          {forrigeKravNavn}
        </Tag>
        {lastModifiedDate && lastModifiedBy && (
          <BodyShort size='small'>
            Sist endret {moment(lastModifiedDate).format('LL')} av{' '}
            {lastModifiedBy.split(' - ')[1] ?? lastModifiedBy}
          </BodyShort>
        )}
      </div>

      {versjonerUtenDokumentasjon.length > 0 && (
        <BodyShort size='small'>
          Det finnes ingen dokumentasjon på {manglendeVersjoner}. Derfor vises svarene fra{' '}
          {forrigeKravNavn}, som er siste versjon dere har dokumentert.
        </BodyShort>
      )}

      <div className='flex flex-col gap-3 bg-gray-100 rounded-lg p-3'>
        {forrigeKrav.suksesskriterier.map((suksesskriterie, index) => {
          const begrunnelse = getSuksesskriterieBegrunnelse(
            forrigeEtterlevelse.suksesskriterieBegrunnelser,
            suksesskriterie
          )
          const status = begrunnelse.suksesskriterieStatus
          const harSkrevetBegrunnelse = !!begrunnelse.begrunnelse?.trim()
          const erBesvart =
            harSkrevetBegrunnelse || (!!status && status !== ESuksesskriterieStatus.IKKE_PAABEGYNT)

          return (
            <Box
              key={suksesskriterie.id}
              className='bg-white'
              padding='space-16'
              borderColor='neutral-subtle'
              borderWidth='1'
              borderRadius='8'
            >
              <div className='flex flex-wrap items-center justify-between gap-2 mb-2'>
                <BodyShort size='small'>
                  Suksesskriterium {index + 1} av {forrigeKrav.suksesskriterier.length}
                </BodyShort>
                <SuksesskriterieEndringTag
                  suksesskriterie={suksesskriterie}
                  sammenlignMed={gjeldendeSuksesskriterier}
                  versjon='forrige'
                />
              </div>
              <Label as='p' className='mb-2'>
                {suksesskriterie.navn}
              </Label>

              {!gjeldendeIds.includes(suksesskriterie.id) && (
                <InlineMessage status='warning' size='small' className='mb-2'>
                  Dette suksesskriteriet har blitt slettet i nåværende kravversjon
                </InlineMessage>
              )}

              {suksesskriterie.beskrivelse && (
                <ReadMore size='small' header='Utfyllende om kriteriet'>
                  <Markdown source={suksesskriterie.beskrivelse} />
                </ReadMore>
              )}

              <div className='my-3'>
                <StatusTag status={status} />
              </div>

              {!suksesskriterie.behovForBegrunnelse && (
                <InfoMelding tekst='Suksesskriteriet krevde ingen begrunnelse.' />
              )}

              {suksesskriterie.behovForBegrunnelse && !erBesvart && (
                <InfoMelding tekst='Suksesskriteriet ble ikke besvart.' />
              )}

              {suksesskriterie.behovForBegrunnelse && erBesvart && (
                <Box className='bg-blue-50 rounded-md' padding='space-16'>
                  <Label as='p' className='mb-2'>
                    {getLabelForSuksessKriterie(status)}
                  </Label>
                  {harSkrevetBegrunnelse ? (
                    <>
                      <div className='wrap-break-word'>
                        <Markdown source={begrunnelse.begrunnelse} />
                      </div>
                      <CopyButton
                        className='mt-2'
                        size='small'
                        variant='action'
                        copyText={begrunnelse.begrunnelse}
                        text='Kopier teksten'
                        activeText='Teksten er kopiert'
                      />
                    </>
                  ) : (
                    <InlineMessage status='info' size='small'>
                      Etterleveren skrev ikke en begrunnelse.
                    </InlineMessage>
                  )}
                </Box>
              )}
            </Box>
          )
        })}
      </div>
    </div>
  )
}

export default Svarhistorikk
