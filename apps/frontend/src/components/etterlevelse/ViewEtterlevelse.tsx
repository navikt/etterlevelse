import { Etterlevelse, EtterlevelseStatus, Krav, SuksesskriterieStatus } from '../../constants'
import { Block } from 'baseui/block'
import { useRef, useState } from 'react'
import { theme } from '../../util'
import moment from 'moment'
import RouteLink from '../common/RouteLink'
import { useBehandling } from '../../api/BehandlingApi'
import { HeadingLarge, HeadingXLarge, LabelSmall, ParagraphMedium, ParagraphXSmall } from 'baseui/typography'
import { Card } from 'baseui/card'
import { ettlevColors } from '../../util/theme'
import { getSuksesskriterieBegrunnelse } from './Edit/SuksesskriterieBegrunnelseEdit'
import { FormikProps } from 'formik'
import { useNavigate } from 'react-router-dom'
import { Markdown } from '../common/Markdown'
import EditBegrunnelse from './Edit/EditBegrunnelse'
import { borderColor, borderRadius, borderStyle, borderWidth, marginAll } from '../common/Style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons'
import { Loader, ReadMore } from '@navikt/ds-react'

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
export const ViewEtterlevelse = ({
  etterlevelse,
  setEtterlevelse,
  loading,
  viewMode,
  krav,
  modalVersion,
}: {
  etterlevelse: Etterlevelse
  setEtterlevelse?: Function
  loading?: boolean
  viewMode?: boolean
  krav: Krav
  modalVersion?: boolean
}) => {
  const [behandling] = useBehandling(etterlevelse.behandlingId)
  const formRef = useRef<FormikProps<any>>()
  const [edit, setEdit] = useState(etterlevelse && !etterlevelse.id)
  const navigate = useNavigate()

  return (
    <Block width="100%" marginTop="48px">
      <Block>
        <HeadingXLarge>{getHeaderText(etterlevelse.status)}</HeadingXLarge>
        {behandling ? (
          <Block marginBottom={'48px'}>
            <ParagraphMedium>
              <strong>
                B{behandling.nummer} {behandling.overordnetFormaal.shortName}
              </strong>
              : {behandling.navn}
            </ParagraphMedium>
            {!modalVersion && (
              <Block display="flex" alignContent="center">
                <FontAwesomeIcon icon={faCircle} color={ettlevColors.black} style={{ fontSize: '.45rem', paddingTop: '7px', marginRight: '8px' }} aria-hidden={true} />
                <RouteLink
                  href={`/behandling/${behandling.id}`}
                  style={{
                    fontSize: '18px',
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: ettlevColors.green800,
                  }}
                >
                  Gå til behandling
                </RouteLink>
              </Block>
            )}
            {!modalVersion && (
              <Block marginTop="8px" display="flex" alignContent="center">
                <FontAwesomeIcon icon={faCircle} color={ettlevColors.black} style={{ fontSize: '.45rem', marginTop: '7px', marginRight: '8px' }} aria-hidden={true} />
                <RouteLink
                  href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}
                  style={{
                    fontSize: '18px',
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: ettlevColors.green800,
                  }}
                >
                  Gå til kravet
                </RouteLink>
              </Block>
            )}
            {/* <Block marginTop={theme.sizing.scale850}>
              <Teams teams={behandling.teams} link list />
            </Block> */}
          </Block>
        ) : (
          etterlevelse.behandlingId && (
            <Block>
              {' '}
              <Loader size={'large'} />
              {etterlevelse.behandlingId}
            </Block>
          )
        )}
      </Block>

      <Block marginTop={theme.sizing.scale950} width="fit-content">
        <Block>
          <Card
            overrides={{
              Contents: {
                style: {
                  ...marginAll('4px'),
                },
              },
              Body: {
                style: {
                  ...marginAll('4px'),
                },
              },
              Root: {
                style: {
                  // Did not use border, margin and border radius to remove warnings.
                  backgroundColor:
                    etterlevelse.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT ? ettlevColors.success50 : '#FFECCC',
                  ...borderColor(
                    etterlevelse.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT ? ettlevColors.success400 : '#D47B00',
                  ),
                  ...borderWidth('1px'),
                  ...borderStyle('solid'),
                  ...borderRadius('4px'),
                },
              },
            }}
          >
            <ParagraphXSmall $style={{ color: ettlevColors.navMorkGra, margin: '0px', fontWeight: 400, lineHeight: '20px' }}>
              Status:{' '}
              {etterlevelse.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT ? 'Ferdig utfylt' : 'Under utfylling'}
            </ParagraphXSmall>
          </Card>
        </Block>
      </Block>

      {etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT && (
        <Block marginTop={'32px'} marginBottom={'40px'}>
          <HeadingLarge
            $style={{
              marginTop: 0,
              marginBottom: '12px',
            }}
          >
            Hvorfor er ikke kravet relevant?
          </HeadingLarge>
          <ParagraphMedium
            $style={{
              marginTop: 0,
              marginBottom: '12px',
            }}
          >
            <Markdown source={etterlevelse.statusBegrunnelse} />
          </ParagraphMedium>
        </Block>
      )}
      {etterlevelse.status === EtterlevelseStatus.OPPFYLLES_SENERE && (
        <Block marginTop={'32px'} marginBottom={'40px'}>
          <HeadingLarge
            $style={{
              marginTop: 0,
              marginBottom: '12px',
            }}
          >
            Oppfylles innen
          </HeadingLarge>
          <ParagraphMedium
            $style={{
              marginTop: 0,
              marginBottom: '12px',
            }}
          >
            {moment(etterlevelse.fristForFerdigstillelse).format('ll')}
          </ParagraphMedium>
        </Block>
      )}
      <Block marginTop={theme.sizing.scale650}>
        <Block display="flex">
          {/* {!viewMode && (
            <Block display="flex" flex="1" justifyContent="flex-end">
              <Block flex="1" display={['none', 'none', 'none', 'none', 'flex', 'flex']} justifyContent="flex-end" alignItems="center">
                {etterlevelse?.id && user.canWrite() && (
                  <Block>
                    <Button
                      startEnhancer={!edit ? <img src={editSecondaryIcon} alt="edit" /> : undefined}
                      size={SIZE.compact}
                      kind={edit ? KIND.secondary : KIND.tertiary}
                      onClick={() => setEdit(!edit)}
                      marginLeft
                    >
                      {edit ? 'Avbryt' : 'Rediger dokumentasjon'}
                    </Button>
                  </Block>
                )}
                {edit && (
                  <Block>
                    <Button size={SIZE.compact} kind={KIND.primary} onClick={() => !formRef.current?.isSubmitting && formRef.current?.submitForm()} marginLeft>
                      Lagre
                    </Button>
                  </Block>
                )}
              </Block>
            </Block>
          )} */}
        </Block>
        {!edit &&
          etterlevelse &&
          !loading &&
          krav.suksesskriterier.map((s, i) => {
            const suksessbeskrivelseBegrunnelse = getSuksesskriterieBegrunnelse(etterlevelse.suksesskriterieBegrunnelser, s)
            return (
              <Block marginBottom={theme.sizing.scale700} key={s.id}>
                <Card
                  overrides={{
                    Root: {
                      style: {
                        ...borderWidth('1px'),
                        ...borderRadius('4px'),
                        backgroundColor: etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT ? ettlevColors.grey50 : ettlevColors.white,
                      },
                    },
                  }}
                >
                  <Block display="flex" justifyContent="center" marginTop={'32px'} marginBottom={'16px'}>
                    <Block display="flex" flex="1">
                      <ParagraphMedium
                        $style={{
                          fontSize: '16px',
                          lineHeight: '18,75',
                          marginTop: '3px',
                          marginBottom: '5px',
                          font: 'roboto',
                          color: ettlevColors.grey600,
                        }}
                      >
                        Suksesskriterium {i + 1} av {krav.suksesskriterier.length}
                      </ParagraphMedium>
                    </Block>
                    {(!suksessbeskrivelseBegrunnelse.behovForBegrunnelse || suksessbeskrivelseBegrunnelse.begrunnelse) && (
                      <Block display="flex" justifyContent="flex-end">
                        <ParagraphXSmall
                          $style={{
                            lineHeight: '24px',
                            color: ettlevColors.green800,
                            marginTop: '0px',
                            marginBottom: '0px',
                            fontStyle: 'italic',
                          }}
                        >
                          {suksessbeskrivelseBegrunnelse.suksesskriterieStatus === SuksesskriterieStatus.OPPFYLT && (
                            <FontAwesomeIcon icon={faCheck} color={ettlevColors.green400} style={{ marginRight: '4px' }} />
                          )}
                          {etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT || suksessbeskrivelseBegrunnelse.suksesskriterieStatus === SuksesskriterieStatus.IKKE_RELEVANT
                            ? 'Ikke Relevant'
                            : suksessbeskrivelseBegrunnelse.suksesskriterieStatus === SuksesskriterieStatus.IKKE_OPPFYLT
                            ? 'Ikke oppfylt'
                            : 'Oppfylt'}
                        </ParagraphXSmall>
                      </Block>
                    )}
                  </Block>
                  <LabelSmall $style={{ fontSize: '21px', lineHeight: '30px', marginTop: '16px', marginBottom: '10px' }}>{s.navn}</LabelSmall>

                  <ReadMore header="Utfyllende om kriteriet">
                    <Markdown source={s.beskrivelse} />
                  </ReadMore>

                  <Block width="100%" height="1px" backgroundColor={ettlevColors.grey100} marginTop="15px" marginBottom="23px" />

                  {!suksessbeskrivelseBegrunnelse.behovForBegrunnelse || suksessbeskrivelseBegrunnelse.begrunnelse ? (
                    <Block>
                      <LabelSmall $style={{ lineHeight: '22px' }} marginTop="16px">
                        {suksessbeskrivelseBegrunnelse.suksesskriterieStatus === SuksesskriterieStatus.IKKE_RELEVANT
                          ? 'Hvorfor er ikke kriteriet relevant?'
                          : suksessbeskrivelseBegrunnelse.suksesskriterieStatus === SuksesskriterieStatus.IKKE_OPPFYLT
                          ? 'Hvorfor er kriteriet ikke oppfylt?'
                          : 'Hvordan er kriteriet oppfylt?'}
                      </LabelSmall>
                      <Block marginBottom={'48px'}>
                        {!suksessbeskrivelseBegrunnelse.behovForBegrunnelse && !suksessbeskrivelseBegrunnelse.begrunnelse ? (
                          <ParagraphMedium>Kriteriet har ikke behov for begrunnelse</ParagraphMedium>
                        ) : (
                          <Markdown source={suksessbeskrivelseBegrunnelse.begrunnelse} />
                        )}
                      </Block>
                    </Block>
                  ) : (
                    <Block marginBottom={'48px'}>
                      <ParagraphMedium $style={{ color: ettlevColors.green800, fontStyle: 'italic' }}>
                        {etterlevelse.status === EtterlevelseStatus.OPPFYLLES_SENERE ? 'Oppfyles senere' : 'Mangler utfylling'}
                      </ParagraphMedium>
                    </Block>
                  )}
                </Card>
              </Block>
            )
          })}
        {edit && etterlevelse && krav && !viewMode && (
          <EditBegrunnelse
            etterlevelse={etterlevelse}
            formRef={formRef}
            krav={krav}
            close={(k) => {
              if (k && setEtterlevelse) {
                setEtterlevelse(k)
                if (k.id !== etterlevelse.id) {
                  navigate(`/etterlevelse/${k.id}`)
                }
              }
              setEdit(false)
            }}
          />
        )}
      </Block>

      <Block>
        <ParagraphMedium
          $style={{
            marginTop: 0,
            marginBottom: 0,
            fontSize: '16px',
            lineHeight: '22px',
          }}
        >
          Sist endret: {moment(etterlevelse.changeStamp.lastModifiedDate).format('ll')} av {etterlevelse.changeStamp.lastModifiedBy.split('-')[1]}
        </ParagraphMedium>
      </Block>
      {/* <Block height={theme.sizing.scale600} />


      <Label title='Dokumentasjon' markdown={etterlevelse.dokumentasjon} />

      <Block height={theme.sizing.scale600} />

      <Label title='Frist for ferdigstillelse'>{formatDate(etterlevelse.fristForFerdigstillelse)}</Label>

      <Block height={theme.sizing.scale600} /> */}
    </Block>
  )
}
