import { Etterlevelse, EtterlevelseStatus, Krav, SuksesskriterieStatus } from '../../constants'
import { useRef, useState } from 'react'
import moment from 'moment'
import { getSuksesskriterieBegrunnelse } from './Edit/SuksesskriterieBegrunnelseEdit'
import { FormikProps } from 'formik'
import { useNavigate } from 'react-router-dom'
import { Markdown } from '../common/Markdown'
import { BodyShort, Box, Heading, Label, Link, Loader, ReadMore, Tag } from '@navikt/ds-react'
import { useEtterlevelseDokumentasjon } from '../../api/EtterlevelseDokumentasjonApi'
import { CheckmarkIcon } from '@navikt/aksel-icons'

const getHeaderText = (status: EtterlevelseStatus) => {
  switch (status) {
    case EtterlevelseStatus.IKKE_RELEVANT:
      return 'Kravet er ikke relevant for:'
    case EtterlevelseStatus.OPPFYLLES_SENERE:
      return 'Kravet skal oppfylles senere av:'
    default:
      return 'Kravet etterleves av:'
  }
}
export const ViewEtterlevelse = ({ etterlevelse, loading, krav, modalVersion }: { etterlevelse: Etterlevelse; loading?: boolean; krav: Krav; modalVersion?: boolean }) => {
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(etterlevelse.etterlevelseDokumentasjonId)

  return (
    <div className="w-full mt-12">
      <div>
        <Heading size="medium">{getHeaderText(etterlevelse.status)}</Heading>
        {etterlevelseDokumentasjon ? (
          <div className="mb-12">
            <BodyShort>
              E{etterlevelseDokumentasjon.etterlevelseNummer} - {etterlevelseDokumentasjon.title}
            </BodyShort>
            {!modalVersion && (
              <div className="flex content-center">
                <li />
                <Link href={`/dokumentasjon/${etterlevelseDokumentasjon.id}`}>Gå til etterlevelse dokumentasjon</Link>
              </div>
            )}
            {!modalVersion && (
              <div className="mt-2 flex content-center">
                <li />
                <Link href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}>Gå til kravet</Link>
              </div>
            )}
          </div>
        ) : (
          etterlevelse.etterlevelseDokumentasjonId && (
            <div>
              {' '}
              <Loader size={'large'} />
              {etterlevelse.etterlevelseDokumentasjonId}
            </div>
          )
        )}
      </div>

      <div className="mt-9 w-fit">
        <Tag
          size="small"
          variant={etterlevelse.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT ? 'success' : 'warning'}
        >
          Status: {etterlevelse.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT ? 'Ferdig utfylt' : 'Under utfylling'}
        </Tag>
      </div>

      {etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT && (
        <div className="my-8">
          <Heading size="medium">Hvorfor er ikke kravet relevant?</Heading>
          <BodyShort>
            <Markdown source={etterlevelse.statusBegrunnelse} />
          </BodyShort>
        </div>
      )}
      {etterlevelse.status === EtterlevelseStatus.OPPFYLLES_SENERE && (
        <div className="my-8">
          <Heading size="medium">Oppfylles innen</Heading>
          <BodyShort>{moment(etterlevelse.fristForFerdigstillelse).format('ll')}</BodyShort>
        </div>
      )}
      <div className="mt-4">
        {etterlevelse &&
          !loading &&
          krav.suksesskriterier.map((s, i) => {
            const suksessbeskrivelseBegrunnelse = getSuksesskriterieBegrunnelse(etterlevelse.suksesskriterieBegrunnelser, s)
            return (
              <div key={s.id} className="mb-5">
                <Box className="bg-white" padding="4">
                  <div className="flex justify-center mt-8 mb-4">
                    <div className="flex flex-1">
                      <BodyShort size="small">
                        Suksesskriterium {i + 1} av {krav.suksesskriterier.length}
                      </BodyShort>
                    </div>
                    {(!suksessbeskrivelseBegrunnelse.behovForBegrunnelse || suksessbeskrivelseBegrunnelse.begrunnelse) && (
                      <div className="flex justify-end">
                        <BodyShort size="small" className="flex items-center">
                          {suksessbeskrivelseBegrunnelse.suksesskriterieStatus === SuksesskriterieStatus.OPPFYLT && <CheckmarkIcon aria-label="" aria-hidden color="#06893A" />}
                          {etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT || suksessbeskrivelseBegrunnelse.suksesskriterieStatus === SuksesskriterieStatus.IKKE_RELEVANT
                            ? 'Ikke Relevant'
                            : suksessbeskrivelseBegrunnelse.suksesskriterieStatus === SuksesskriterieStatus.IKKE_OPPFYLT
                            ? 'Ikke oppfylt'
                            : 'Oppfylt'}
                        </BodyShort>
                      </div>
                    )}
                  </div>
                  <Label>{s.navn}</Label>

                  <ReadMore header="Utfyllende om kriteriet">
                    <Markdown source={s.beskrivelse} />
                  </ReadMore>

                  <div className="w-full h-[1px] mt-4 mb-6 bg-gray-400" />

                  {!suksessbeskrivelseBegrunnelse.behovForBegrunnelse || suksessbeskrivelseBegrunnelse.begrunnelse ? (
                    <div>
                      <Label>
                        {suksessbeskrivelseBegrunnelse.suksesskriterieStatus === SuksesskriterieStatus.IKKE_RELEVANT
                          ? 'Hvorfor er ikke kriteriet relevant?'
                          : suksessbeskrivelseBegrunnelse.suksesskriterieStatus === SuksesskriterieStatus.IKKE_OPPFYLT
                          ? 'Hvorfor er kriteriet ikke oppfylt?'
                          : 'Hvordan er kriteriet oppfylt?'}
                      </Label>
                      <div className="mb-12">
                        {!suksessbeskrivelseBegrunnelse.behovForBegrunnelse && !suksessbeskrivelseBegrunnelse.begrunnelse ? (
                          <BodyShort>Kriteriet har ikke behov for begrunnelse</BodyShort>
                        ) : (
                          <Markdown source={suksessbeskrivelseBegrunnelse.begrunnelse} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-12">
                      <BodyShort>{etterlevelse.status === EtterlevelseStatus.OPPFYLLES_SENERE ? 'Oppfyles senere' : 'Mangler utfylling'}</BodyShort>
                    </div>
                  )}
                </Box>
              </div>
            )
          })}
      </div>

      <BodyShort size="small">
        Sist endret: {moment(etterlevelse.changeStamp.lastModifiedDate).format('ll')} av {etterlevelse.changeStamp.lastModifiedBy.split('-')[1]}
      </BodyShort>
    </div>
  )
}
