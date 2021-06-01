import { Etterlevelse } from '../../constants'
import { Block } from 'baseui/block'
import React, { useRef, useState } from 'react'
import { etterlevelseStatus } from '../../pages/EtterlevelsePage'
import { theme } from '../../util'
import moment from 'moment'
import RouteLink from '../common/RouteLink'
import { behandlingName, useBehandling } from '../../api/BehandlingApi'
import { Spinner } from '../common/Spinner'
import { Label } from '../common/PropertyLabel'
import { H2, Paragraph2 } from 'baseui/typography'
import { Teams } from '../common/TeamName'
import { Card } from 'baseui/card'
import { ettlevColors } from '../../util/theme'
import { bokEtterlevelseIcon, editSecondaryIcon } from '../Images'
import { user } from '../../services/User'
import Button from '../common/Button'
import { FormikProps } from 'formik'
import { EditEtterlevelse } from './EditEtterlevelse'
import { useHistory } from 'react-router-dom'
import { KIND, SIZE } from 'baseui/button'


const formatDate = (date?: string) => date && moment(date).format('ll')

export const ViewEtterlevelse = ({ etterlevelse, setEtterlevelse, loading, viewMode }: { etterlevelse: Etterlevelse, setEtterlevelse: Function, loading?: boolean, viewMode?: boolean }) => {
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
                  lineHeight: '40px'
                }}
              >
                {behandlingName(behandling)}
              </RouteLink>
              <Paragraph2 marginTop='2px'>
                Overordnet behandlingsaktivitet
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
            <Card>
              <Paragraph2 $style={{ fontWeight: 900, lineHeight: '22px', color: ettlevColors.green600 }}>
                Status: {etterlevelseStatus(etterlevelse.status)}
              </Paragraph2>
            </Card>
          </Block>
        </Block>
      </Block>

      <Block marginTop={theme.sizing.scale1400}>
        <Block display='flex'>
          <H2>
            Dokumetasjon
           </H2>
          {!viewMode &&
            <Block display='flex' flex='1' justifyContent='flex-end'>
              <Block flex='1' display={['none', 'none', 'none', 'none', 'flex', 'flex']} justifyContent='flex-end' alignItems='center'>
                {((etterlevelse?.id && user.canWrite())) &&
                  <Block>
                    <Button
                      startEnhancer={!edit ? <img src={editSecondaryIcon} alt='edit' /> : undefined}
                      size={SIZE.compact}
                      kind={KIND.secondary}
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
                      kind={KIND.secondary}
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
        {!edit && etterlevelse && !loading && <Card>
          <Block display='flex' width='100%'>
            <Block>
              <Label title='' markdown={etterlevelse.begrunnelse} />
            </Block>
            <Block display='flex' flex='1' justifyContent='flex-end'>
              <Block marginLeft={theme.sizing.scale1600}>
                <img src={bokEtterlevelseIcon} alt='dokumentasjons ikon' />
              </Block>
            </Block>
          </Block>
        </Card>}
        {
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

        }
      </Block>

      {/* <Block height={theme.sizing.scale600} />


      <Label title='Dokumentasjon' markdown={etterlevelse.dokumentasjon} />

      <Block height={theme.sizing.scale600} />

      <Label title='Frist for ferdigstillelse'>{formatDate(etterlevelse.fristForFerdigstillelse)}</Label>

      <Block height={theme.sizing.scale600} /> */}


    </Block >
  )
}
