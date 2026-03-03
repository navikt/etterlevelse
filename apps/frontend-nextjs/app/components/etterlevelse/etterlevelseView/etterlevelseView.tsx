import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { Markdown } from '@/components/common/markdown/markdown'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
  IEtterlevelse,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { IKrav } from '@/constants/krav/kravConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { getSuksesskriterieBegrunnelse } from '@/util/etterlevelseUtil/etterlevelseUtil'
import { CheckmarkIcon } from '@navikt/aksel-icons'
import { BodyShort, Box, Heading, Label, Link, Loader, ReadMore, Tag } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'

type TProps = {
  etterlevelse: IEtterlevelse
  loading?: boolean
  krav: IKrav
  modalVersion?: boolean
}

const getHeaderText = (status: EEtterlevelseStatus) => {
  switch (status) {
    case EEtterlevelseStatus.IKKE_RELEVANT:
      return 'Kravet er ikke relevant for:'
    case EEtterlevelseStatus.OPPFYLLES_SENERE:
      return 'Kravet skal oppfylles senere av:'
    default:
      return 'Kravet etterleves av:'
  }
}

export const ViewEtterlevelse: FunctionComponent<TProps> = ({
  etterlevelse,
  loading,
  krav,
  modalVersion,
}) => {
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(
    etterlevelse.etterlevelseDokumentasjonId
  )

  return (
    <div className='w-full mt-12'>
      <div>
        <Heading size='medium'>{getHeaderText(etterlevelse.status)}</Heading>
        {etterlevelseDokumentasjon && (
          <div className='mb-12'>
            <BodyShort>
              E{etterlevelseDokumentasjon.etterlevelseNummer}.
              {etterlevelseDokumentasjon.etterlevelseDokumentVersjon} -{' '}
              {etterlevelseDokumentasjon.title}
            </BodyShort>
            {!modalVersion && (
              <>
                <div className='flex content-center'>
                  <li />
                  <Link href={etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id)}>
                    Gå til etterlevelse dokumentasjon
                  </Link>
                </div>
                <div className='mt-2 flex content-center'>
                  <li />
                  <Link href={kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon)}>
                    Gå til kravet
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {!etterlevelseDokumentasjon && (
          <>
            {etterlevelse.etterlevelseDokumentasjonId && (
              <div>
                <Loader size='large' className='flex justify-self-center' />
                {etterlevelse.etterlevelseDokumentasjonId}
              </div>
            )}
          </>
        )}
      </div>

      <div className='mt-9 w-fit'>
        <Tag
          size='small'
          variant={
            etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
            etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT
              ? 'success'
              : 'warning'
          }
        >
          Status:{' '}
          {etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
          etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT
            ? 'Ferdig utfylt'
            : 'Under utfylling'}
        </Tag>
      </div>

      {etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT && (
        <div className='my-8'>
          <Heading size='medium'>Hvorfor er ikke kravet relevant?</Heading>
          <BodyShort>
            <Markdown source={etterlevelse.statusBegrunnelse} />
          </BodyShort>
        </div>
      )}
      {etterlevelse.status === EEtterlevelseStatus.OPPFYLLES_SENERE && (
        <div className='my-8'>
          <Heading size='medium'>Oppfylles innen</Heading>
          <BodyShort>{moment(etterlevelse.fristForFerdigstillelse).format('LL')}</BodyShort>
        </div>
      )}
      <div className='mt-4'>
        {etterlevelse &&
          !loading &&
          krav.suksesskriterier.map((suksesskriterium, index) => {
            const suksessbeskrivelseBegrunnelse = getSuksesskriterieBegrunnelse(
              etterlevelse.suksesskriterieBegrunnelser,
              suksesskriterium
            )
            return (
              <div key={suksesskriterium.id} className='mb-5'>
                <Box className='bg-white' padding='space-4'>
                  <div className='flex justify-center mt-8 mb-4'>
                    <div className='flex flex-1'>
                      <BodyShort size='small'>
                        Suksesskriterium {index + 1} av {krav.suksesskriterier.length}
                      </BodyShort>
                    </div>
                    {(!suksessbeskrivelseBegrunnelse.behovForBegrunnelse ||
                      suksessbeskrivelseBegrunnelse.begrunnelse) && (
                      <div className='flex justify-end'>
                        <BodyShort size='small' className='flex items-center'>
                          {suksessbeskrivelseBegrunnelse.suksesskriterieStatus ===
                            ESuksesskriterieStatus.OPPFYLT && (
                            <CheckmarkIcon aria-label='' aria-hidden color='#06893A' />
                          )}
                          {etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT ||
                          suksessbeskrivelseBegrunnelse.suksesskriterieStatus ===
                            ESuksesskriterieStatus.IKKE_RELEVANT
                            ? 'Ikke Relevant'
                            : suksessbeskrivelseBegrunnelse.suksesskriterieStatus ===
                                ESuksesskriterieStatus.IKKE_OPPFYLT
                              ? 'Ikke oppfylt'
                              : 'Oppfylt'}
                        </BodyShort>
                      </div>
                    )}
                  </div>
                  <Label>{suksesskriterium.navn}</Label>

                  <ReadMore defaultOpen header='Utfyllende om kriteriet'>
                    <Markdown source={suksesskriterium.beskrivelse} />
                  </ReadMore>

                  <div className='w-full h-[0.063rem] mt-4 mb-6 bg-gray-400' />

                  {!suksessbeskrivelseBegrunnelse.behovForBegrunnelse ||
                  suksessbeskrivelseBegrunnelse.begrunnelse ? (
                    <div>
                      <Label>
                        {suksessbeskrivelseBegrunnelse.suksesskriterieStatus ===
                        ESuksesskriterieStatus.IKKE_RELEVANT
                          ? 'Hvorfor er ikke kriteriet relevant?'
                          : suksessbeskrivelseBegrunnelse.suksesskriterieStatus ===
                              ESuksesskriterieStatus.IKKE_OPPFYLT
                            ? 'Hvorfor er kriteriet ikke oppfylt?'
                            : 'Hvordan er kriteriet oppfylt?'}
                      </Label>
                      <div className='mb-12'>
                        {!suksessbeskrivelseBegrunnelse.behovForBegrunnelse &&
                        !suksessbeskrivelseBegrunnelse.begrunnelse ? (
                          <BodyShort>Kriteriet har ikke behov for begrunnelse</BodyShort>
                        ) : (
                          <Markdown source={suksessbeskrivelseBegrunnelse.begrunnelse} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className='mb-12'>
                      <BodyShort>
                        {etterlevelse.status === EEtterlevelseStatus.OPPFYLLES_SENERE
                          ? 'Oppfyles senere'
                          : 'Mangler utfylling'}
                      </BodyShort>
                    </div>
                  )}
                </Box>
              </div>
            )
          })}
      </div>

      <BodyShort size='small'>
        Sist endret: {moment(etterlevelse.changeStamp.lastModifiedDate).format('LL')} av{' '}
        {etterlevelse.changeStamp.lastModifiedBy.split('-')[1]}
      </BodyShort>
    </div>
  )
}
