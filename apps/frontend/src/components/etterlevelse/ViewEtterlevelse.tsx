import { Etterlevelse, EtterlevelseStatus, Krav } from '../../constants'
import { Block } from 'baseui/block'
import React, { useRef, useState } from 'react'
import { theme } from '../../util'
import moment from 'moment'
import RouteLink from '../common/RouteLink'
import { useBehandling } from '../../api/BehandlingApi'
import { Spinner } from '../common/Spinner'
import { H2, H3, Label3, Paragraph2, Paragraph4 } from 'baseui/typography'
import { Card } from 'baseui/card'
import { ettlevColors } from '../../util/theme'
import { getSuksesskriterieBegrunnelse } from './Edit/SuksesskriterieBegrunnelseEdit'
import { FormikProps } from 'formik'
import { useHistory } from 'react-router-dom'
import { Markdown } from '../common/Markdown'
import EditBegrunnelse from './Edit/EditBegrunnelse'
import { borderColor, borderRadius, borderStyle, borderWidth, marginAll } from '../common/Style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons'

const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewEtterlevelse = ({
  etterlevelse,
  setEtterlevelse,
  loading,
  viewMode,
  krav,
}: {
  etterlevelse: Etterlevelse
  setEtterlevelse: Function
  loading?: boolean
  viewMode?: boolean
  krav: Krav
}) => {
  const [behandling] = useBehandling(etterlevelse.behandlingId)
  const formRef = useRef<FormikProps<any>>()
  const [edit, setEdit] = useState(etterlevelse && !etterlevelse.id)
  const history = useHistory()

  return (
    <Block width="100%" marginTop="48px">
      <Block>
        <H2>{etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT ? 'Kravet er ikke relevant for:' : 'Kravet etterleves av:'}</H2>
        {behandling ? (
          <Block marginBottom={'48px'}>
            <Paragraph2>
              <strong>
                B{behandling.nummer} {behandling.overordnetFormaal.shortName}
              </strong>
              : {behandling.navn}
            </Paragraph2>
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
            {/* <Block marginTop={theme.sizing.scale850}>
              <Teams teams={behandling.teams} link list />
            </Block> */}
          </Block>
        ) : (
          etterlevelse.behandlingId && (
            <Block>
              {' '}
              <Spinner size={theme.sizing.scale600} />
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
            <Paragraph4 $style={{ color: ettlevColors.navMorkGra, margin: '0px', fontWeight: 400, lineHeight: '20px' }}>
              Status:{' '}
              {etterlevelse.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT ? 'Ferdig utfylt' : 'Under utfylling'}
            </Paragraph4>
          </Card>
        </Block>
      </Block>

      {etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT &&
        (<Block marginTop={'32px'} marginBottom={'40px'}>
          <H3 $style={{
            marginTop: 0,
            marginBottom: '12px'
          }}>
            Hvorfor er ikke kravet relevant?
          </H3>
          <Paragraph2 $style={{
            marginTop: 0,
            marginBottom: '12px'
          }}>
            {etterlevelse.statusBegrunnelse}
          </Paragraph2>
        </Block>)}
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
                    Body: {
                      style: {
                        ...borderWidth('1px'),
                        ...borderRadius('4px'),
                      },
                    },
                    Root: {
                      style: {
                        ...borderWidth('1px'),
                        ...borderRadius('4px'),
                        backgroundColor: etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT ? ettlevColors.grey50 : ettlevColors.white
                      },
                    }
                  }}
                >
                  <Block display="flex" justifyContent="center" marginTop={'32px'} marginBottom={'16px'}>
                    <Block display="flex" flex="1">
                      <Label3 $style={{ color: ettlevColors.green600 }}>
                        SUKSESSKRITERIE {i + 1} AV {krav.suksesskriterier.length}
                      </Label3>
                    </Block>
                    {(etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT || suksessbeskrivelseBegrunnelse.begrunnelse) && (
                      <Block display="flex" justifyContent="flex-end">
                        <Paragraph4
                          $style={{
                            lineHeight: '24px',
                            color: ettlevColors.green800,
                            marginTop: '0px',
                            marginBottom: '0px',
                            fontStyle: 'italic'
                          }}
                        >
                          {suksessbeskrivelseBegrunnelse.oppfylt && <FontAwesomeIcon icon={faCheck} color={ettlevColors.green400} style={{ marginRight: '4px' }} />}
                          {etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT || suksessbeskrivelseBegrunnelse.ikkeRelevant ? 'Ikke Relevant' : 'Oppfylt'}
                        </Paragraph4>
                      </Block>
                    )}
                  </Block>
                  <Label3 $style={{ fontSize: '21px', lineHeight: '30px', marginTop: '16px', marginBottom: '48px' }}>{s.navn}</Label3>
                  {suksessbeskrivelseBegrunnelse.begrunnelse || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT ? (
                    <Block>
                      {(suksessbeskrivelseBegrunnelse.oppfylt || suksessbeskrivelseBegrunnelse.ikkeRelevant) && (
                        <Block>
                          <Label3 $style={{ lineHeight: '22px' }} marginTop="16px">
                            Hvordan er kriteriet oppfylt?
                          </Label3>
                          <Block marginBottom={'48px'}>
                            <Markdown
                              source={suksessbeskrivelseBegrunnelse.begrunnelse}
                            />
                          </Block>
                        </Block>
                      )}
                    </Block>
                  ) : (
                    <Block marginBottom={'48px'}>
                      <Paragraph2 $style={{ color: ettlevColors.green800, fontStyle: 'italic' }}>Mangler utfylling</Paragraph2>
                    </Block>
                  )}
                </Card>
              </Block>
            )
          })}
        {edit && etterlevelse && krav && (
          <EditBegrunnelse
            etterlevelse={etterlevelse}
            formRef={formRef}
            krav={krav}
            close={(k) => {
              if (k) {
                setEtterlevelse(k)
                if (k.id !== etterlevelse.id) {
                  history.push(`/etterlevelse/${k.id}`)
                }
              }
              setEdit(false)
            }}
          />
        )}
      </Block>

      <Block>
        <Paragraph2 $style={{
          marginTop: 0,
          marginBottom: 0,
          fontSize: '16px',
          lineHeight: '22px'
        }}>
          Sist endret: {moment(etterlevelse.changeStamp.lastModifiedDate).format('ll')} av {etterlevelse.changeStamp.lastModifiedBy.split('-')[1]}
        </Paragraph2>
      </Block>
      {/* <Block height={theme.sizing.scale600} />


      <Label title='Dokumentasjon' markdown={etterlevelse.dokumentasjon} />

      <Block height={theme.sizing.scale600} />

      <Label title='Frist for ferdigstillelse'>{formatDate(etterlevelse.fristForFerdigstillelse)}</Label>

      <Block height={theme.sizing.scale600} /> */}
    </Block>
  )
}
