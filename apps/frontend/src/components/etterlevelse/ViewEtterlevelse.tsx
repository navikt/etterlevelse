import { Etterlevelse, Krav } from '../../constants'
import { Block } from 'baseui/block'
import React, { useRef, useState } from 'react'
import { getEtterlevelseStatus } from '../../pages/EtterlevelsePage'
import { theme } from '../../util'
import moment from 'moment'
import RouteLink from '../common/RouteLink'
import { behandlingName, useBehandling } from '../../api/BehandlingApi'
import { Spinner } from '../common/Spinner'
import { H2, Label3, Paragraph2, Paragraph4 } from 'baseui/typography'
import { Teams } from '../common/TeamName'
import { Card } from 'baseui/card'
import { ettlevColors } from '../../util/theme'
import { editSecondaryIcon } from '../Images'
import { user } from '../../services/User'
import Button from '../common/Button'
import { getSuksesskriterieBegrunnelse } from './Edit/SuksesskriterieBegrunnelseEdit'
import { FormikProps } from 'formik'
import { useHistory } from 'react-router-dom'
import { KIND, SIZE } from 'baseui/button'
import { Markdown } from '../common/Markdown'
import EditBegrunnelse from './Edit/EditBegrunnelse'
import { borderColor, borderRadius, borderStyle, borderWidth } from '../common/Style'

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
        <H2>Kravet etterleves av</H2>
        {behandling ? (
          <Block>
            <Paragraph2>
              <strong>{behandling.overordnetFormaal.shortName}</strong>: {' '} {behandling.navn}
            </Paragraph2>
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
                  marginRight: '8px',
                  marginLeft: '8px',
                  marginTop: '8px',
                  marginBottom: '8px',
                },
              },
              Body: {
                style: {
                  marginRight: '8px',
                  marginLeft: '8px',
                  marginTop: '8px',
                  marginBottom: '8px',
                },
              },
              Root: {
                style: {
                  // Did not use border, margin and border radius to remove warnings.
                  backgroundColor: ettlevColors.success50,
                  ...borderColor(ettlevColors.success400),
                  ...borderWidth('1px'),
                  ...borderStyle('solid'),
                  ...borderRadius('4px'),
                },
              },
            }}
          >
            <Paragraph4 $style={{ color: ettlevColors.navMorkGra, margin: '0px', fontWeight: 600, lineHeight: '20px' }}>Kravet er: {getEtterlevelseStatus(etterlevelse.status)}</Paragraph4>
          </Card>
        </Block>
      </Block>

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
                <Card>
                  <Block display="flex" justifyContent="center">
                    <Block display="flex" flex="1">
                      <Label3 $style={{ color: ettlevColors.green600 }}>
                        SUKSESSKRITERIE {i + 1} AV {krav.suksesskriterier.length}
                      </Label3>
                    </Block>
                    <Block display="flex" justifyContent="flex-end">
                      <Paragraph4 $style={{ lineHeight: '24px', color: ettlevColors.green800, marginTop: '0px', marginBottom: '0px' }}>{suksessbeskrivelseBegrunnelse.oppfylt ? 'Oppfylt' : 'Ikke Relevant'}</Paragraph4>
                    </Block>
                  </Block>
                  <Label3 $style={{ fontSize: '21px', lineHeight: '30px' }}>{s.navn}</Label3>
                  <Label3 $style={{ lineHeight: '22px' }} marginTop="16px">
                    Hvordan er kriteriet oppfylt?
                  </Label3>
                  {(suksessbeskrivelseBegrunnelse.oppfylt || suksessbeskrivelseBegrunnelse.ikkeRelevant) && <Markdown source={suksessbeskrivelseBegrunnelse.begrunnelse} />}
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

      {/* <Block height={theme.sizing.scale600} />


      <Label title='Dokumentasjon' markdown={etterlevelse.dokumentasjon} />

      <Block height={theme.sizing.scale600} />

      <Label title='Frist for ferdigstillelse'>{formatDate(etterlevelse.fristForFerdigstillelse)}</Label>

      <Block height={theme.sizing.scale600} /> */}
    </Block>
  )
}
