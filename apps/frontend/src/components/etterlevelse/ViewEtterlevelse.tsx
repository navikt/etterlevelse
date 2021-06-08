import { Etterlevelse, Krav } from '../../constants'
import { Block } from 'baseui/block'
import React, { useRef, useState } from 'react'
import { etterlevelseStatus } from '../../pages/EtterlevelsePage'
import { theme } from '../../util'
import moment from 'moment'
import RouteLink from '../common/RouteLink'
import { behandlingName, useBehandling } from '../../api/BehandlingApi'
import { Spinner } from '../common/Spinner'
import { Label } from '../common/PropertyLabel'
import { H2, Label3, Paragraph2, Paragraph4 } from 'baseui/typography'
import { Teams } from '../common/TeamName'
import { Card } from 'baseui/card'
import { ettlevColors } from '../../util/theme'
import { bokEtterlevelseIcon, editSecondaryIcon } from '../Images'
import { user } from '../../services/User'
import Button from '../common/Button'
import {getSuksesskriterieBegrunnelse} from './Edit/SuksesskriterieBegrunnelseEdit'
import { FormikProps } from 'formik'
import { EditEtterlevelse } from './EditEtterlevelse'
import { useHistory } from 'react-router-dom'
import { KIND, SIZE } from 'baseui/button'
import { Markdown } from '../common/Markdown'



const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewEtterlevelse = ({ etterlevelse, setEtterlevelse, loading, viewMode, krav }: { etterlevelse: Etterlevelse, setEtterlevelse: Function, loading?: boolean, viewMode?: boolean, krav: Krav }) => {
  const [behandling] = useBehandling(etterlevelse.behandlingId)
  const formRef = useRef<FormikProps<any>>()
  const [edit, setEdit] = useState(etterlevelse && !etterlevelse.id)
  const history = useHistory()


  return (
    <Block width='100%' marginTop='48px'>
      <Block display='flex' width='100%'>
        <Block>
          <H2>
            Kravet etterleves av
      </H2>
          {behandling ?
            <Block>
              <RouteLink
                href={`/behandling/${behandling.id}`}
                style={{
                  fontSize: '21px',
                  fontWeight: 700,
                  lineHeight: '40px',
                  color: ettlevColors.green600
                }}
              >
                {behandlingName(behandling)}
              </RouteLink>
              <Paragraph2 marginTop='2px'>
                {behandling.overordnetFormaal.shortName}
              </Paragraph2>
              <Block marginTop={theme.sizing.scale850}>
                <Teams teams={behandling.teams} link list />
              </Block>
            </Block>
            : etterlevelse.behandlingId && <Block> <Spinner size={theme.sizing.scale600} />{etterlevelse.behandlingId}</Block>
          }
        </Block>

        <Block display='flex' flex='1' justifyContent='flex-end' marginTop={theme.sizing.scale950}>
          <Block>
            <Card overrides={{
              Contents: {
                style: {
                  marginRight: '8px',
                  marginLeft: '8px',
                  marginTop: '8px',
                  marginBottom: '8px',
                }
              },
              Body: {
                style: {
                  marginRight: '8px',
                  marginLeft: '8px',
                  marginTop: '8px',
                  marginBottom: '8px',
                }
              },
              Root: {
                style: {
                  // Did not use border, margin and border radius to remove warnings.
                  backgroundColor: ettlevColors.success50,
                  borderRightColor: ettlevColors.success400,
                  borderLeftColor: ettlevColors.success400,
                  borderTopColor: ettlevColors.success400,
                  borderBottomColor: ettlevColors.success400,
                  borderLeftWidth: '1px',
                  borderRightWidth: '1px',
                  borderTopWidth: '1px',
                  borderBottomWidth: '1px',
                  borderLeftStyle: 'solid',
                  borderRightStyle: 'solid',
                  borderTopStyle: 'solid',
                  borderBottomStyle: 'solid',
                  borderBottomLeftRadius: '4px',
                  borderBottomRightRadius: '4px',
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px',
                }
              }
            }}
            >
              <Paragraph4 $style={{ color: ettlevColors.navMorkGra, margin: '0px' }}>
                Kravet er: {etterlevelseStatus(etterlevelse.status)}
              </Paragraph4>
            </Card>
          </Block>
        </Block>
      </Block>

      <Block marginTop={theme.sizing.scale1400}>
        <Block display='flex'>
          <H2>
            Dokumentasjon
           </H2>
          {!viewMode &&
            <Block display='flex' flex='1' justifyContent='flex-end'>
              <Block flex='1' display={['none', 'none', 'none', 'none', 'flex', 'flex']} justifyContent='flex-end' alignItems='center'>
                {((etterlevelse?.id && user.canWrite())) &&
                  <Block>
                    <Button
                      startEnhancer={!edit ? <img src={editSecondaryIcon} alt='edit' /> : undefined}
                      size={SIZE.compact}
                      kind={edit? KIND.secondary : KIND.tertiary}
                      onClick={() => setEdit(!edit)}
                      marginLeft
                    >
                      {edit ? 'Avbryt' : 'Rediger dokumentasjon'}
                    </Button>
                  </Block>
                }
                {edit &&
                  <Block>
                    <Button
                      size={SIZE.compact}
                      kind={KIND.primary}
                      onClick={() => !formRef.current?.isSubmitting && formRef.current?.submitForm()}
                      marginLeft
                    >
                      Lagre
                </Button>
                  </Block>
                }
              </Block>
            </Block>
          }
        </Block>
        {!edit && etterlevelse && !loading &&
          krav.suksesskriterier.map((s, i) => {
            const suksessbeskrivelseBegrunnelse = getSuksesskriterieBegrunnelse(etterlevelse.suksesskriterieBegrunnelser, s)
            return (
              <Block marginBottom={theme.sizing.scale700}>
                <Card>
                  <Label3 $style={{ color: ettlevColors.green600 }}>
                    SUKSESSKRITERIE {i + 1} AV {krav.suksesskriterier.length}
                  </Label3>
                  <Label3 $style={{ fontSize: '21px', lineHeight: '30px' }}>
                    {s.navn}
                  </Label3>
                  <Label3 $style={{ lineHeight: '22px' }} marginTop='16px'>
                    Hvordan er kriteriet oppfylt?
                </Label3>
                <Markdown source={suksessbeskrivelseBegrunnelse.begrunnelse}/>
                </Card>
              </Block>
            )
          })
        }
        {/* {
          edit && etterlevelse &&

          <EditEtterlevelse documentEdit lockBehandlingAndKrav etterlevelse={etterlevelse} formRef={formRef} close={k => {
            if (k) {
              setEtterlevelse(k)
              if (k.id !== etterlevelse.id) {
                history.push(`/etterlevelse/${k.id}`)
              }
            }
            setEdit(false)
          }} />

        } */}
      </Block>

      {/* <Block height={theme.sizing.scale600} />


      <Label title='Dokumentasjon' markdown={etterlevelse.dokumentasjon} />

      <Block height={theme.sizing.scale600} />

      <Label title='Frist for ferdigstillelse'>{formatDate(etterlevelse.fristForFerdigstillelse)}</Label>

      <Block height={theme.sizing.scale600} /> */}


    </Block >
  )
}
