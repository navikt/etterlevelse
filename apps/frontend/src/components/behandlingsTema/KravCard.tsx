import { EtterlevelseMetadata, KRAV_FILTER_TYPE, KravEtterlevelseData } from '../../constants'
import React, { useEffect, useState } from 'react'
import { getEtterlevelseMetadataByBehandlingsIdAndKravNummerAndKravVersion, mapEtterlevelseMetadataToFormValue } from '../../api/EtterlevelseMetadataApi'
import { Block } from 'baseui/block'
import Button from '../common/Button'
import { ettlevColors } from '../../util/theme'
import { borderStyle } from '../common/Style'
import { Label3, Paragraph4 } from 'baseui/typography'
import StatusView from '../common/StatusTag'
import { getEtterlevelseStatus, getEtterlevelseStatusLabelColor } from '../behandling/utils'
import moment from 'moment'
import TildeltPopoever from '../etterlevelseMetadata/TildeltPopover'
import { isFerdigUtfylt } from '../../pages/BehandlingerTemaPageV2'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { arkCheckIcon, arkPennIcon, warningAlert } from '../Images'
import { getEtterlevelserByBehandlingsIdKravNumber } from '../../api/EtterlevelseApi'
import { useLocation, useNavigate } from 'react-router-dom'
import { getNumberOfDaysBetween } from '../../util/checkAge'

export const KravCard = (props: { krav: KravEtterlevelseData; noStatus?: boolean; behandlingId: string; noVarsling?: boolean; kravFilter: KRAV_FILTER_TYPE }) => {
  const [nyVersionFlag, setNyVersionFlag] = useState<boolean>(false)
  const [hover, setHover] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [kravAge, setKravAge] = useState<number>(0)

  const [etterlevelseMetadata, setEtterlevelseMetadata] = useState<EtterlevelseMetadata>(
    mapEtterlevelseMetadataToFormValue({
      id: 'ny',
      behandlingId: props.behandlingId,
      kravNummer: props.krav.kravNummer,
      kravVersjon: props.krav.kravVersjon,
    }),
  )

  const getEtterlevelseMetaData = () => {
    getEtterlevelseMetadataByBehandlingsIdAndKravNummerAndKravVersion(props.behandlingId, props.krav.kravNummer, props.krav.kravVersjon).then((resp) => {
      if (resp.content.length) {
        setEtterlevelseMetadata(resp.content[0])
      } else {
        setEtterlevelseMetadata(
          mapEtterlevelseMetadataToFormValue({
            id: 'ny',
            behandlingId: props.behandlingId,
            kravNummer: props.krav.kravNummer,
            kravVersjon: props.krav.kravVersjon,
          }),
        )
      }
    })
  }

  useEffect(() => {
    const today = new Date()
    const kravCreatedDate = moment(props.krav.changeStamp.createdDate).toDate()
    setKravAge(getNumberOfDaysBetween(kravCreatedDate, today))
    ;(async () => {
      getEtterlevelseMetaData()
      if (props.krav.kravVersjon > 1 && props.krav.etterlevelseStatus === undefined) {
        setNyVersionFlag((await getEtterlevelserByBehandlingsIdKravNumber(props.behandlingId, props.krav.kravNummer)).content.length >= 1)
      }
    })()
  }, [])

  return (
    <Block
      display={'flex'}
      $style={{
        boxShadow: '0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 2px 0 rgba(0, 0, 0, .12)',
        ':hover': { boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)' },
        ':active': { boxShadow: '0 2px 1px -2px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 1px 0 rgba(0, 0, 0, .12)' },
        ':focus': {
          boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
          outline: `3px solid ${ettlevColors.focusOutline}`,
        },
      }}
    >
      <Block width="100%">
        <Button
          notBold
          $style={{
            width: '100%',
            paddingTop: '8px',
            paddingBottom: '8px',
            paddingRight: '24px',
            paddingLeft: '8px',
            display: 'flex',
            justifyContent: 'flex-start',
            backgroundColor: ettlevColors.white,
            ...borderStyle('hidden'),
            ':hover': { backgroundColor: 'none', boxShadow: '' },
            boxShadow: '',
          }}
          onClick={() => {
            navigate(location.pathname + '/krav/' + props.krav.kravNummer + '/' + props.krav.kravVersjon + '/' + props.kravFilter)
          }}
        >
          <Block display="flex" justifyContent="center" alignItems="center" width="100%" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Block marginLeft="8px">
              {props.krav.isIrrelevant || isFerdigUtfylt(props.krav.etterlevelseStatus) ? <img src={arkCheckIcon} alt="" /> : <img src={arkPennIcon} alt="" />}
            </Block>
            <Block marginLeft="14px">
              <Block display={'flex'} alignItems={'center'}>
                <Paragraph4
                  $style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '0px', marginTop: '0px', width: 'fit-content', textDecoration: hover ? 'underline' : 'none' }}
                >
                  K{props.krav.kravNummer}.{props.krav.kravVersjon}
                </Paragraph4>
                {!props.noVarsling && props.krav.kravVersjon === 1 && props.krav.etterlevelseStatus === undefined && kravAge < 30 && showWarningMessage('Nytt krav')}
                {!props.noVarsling && props.krav.etterlevelseStatus === undefined && nyVersionFlag && showWarningMessage('Ny version')}
              </Block>
              <Label3 $style={{ fontSize: '18px', fontWeight: 600, alignContent: 'flex-start', textAlign: 'left', textDecoration: hover ? 'underline' : 'none' }}>
                {props.krav.navn}
              </Label3>
            </Block>
            <Block display="flex" justifyContent="flex-end" flex="1" width="100%">
              <Block width="350px" display="flex" justifyContent="flex-end" marginLeft="32px">
                <Block display="flex" width="100%" maxWidth="220px" justifyContent="flex-end">
                  {props.krav && props.krav.etterlevelseStatus && (
                    <StatusView status={getEtterlevelseStatus(props.krav)} statusDisplay={getEtterlevelseStatusLabelColor(props.krav)} />
                  )}
                </Block>
                {!props.krav.isIrrelevant && (
                  <Block marginLeft="31px" maxWidth="140px" width="100%">
                    {etterlevelseMetadata && etterlevelseMetadata.tildeltMed && etterlevelseMetadata.tildeltMed.length >= 1 ? (
                      <Block>
                        <Label3 $style={{ fontSize: '14px', lineHeight: '14px', textAlign: 'right' }}>
                          Tildelt:{' '}
                          {etterlevelseMetadata.tildeltMed[0].length > 12 ? etterlevelseMetadata.tildeltMed[0].substring(0, 11) + '...' : etterlevelseMetadata.tildeltMed[0]}
                        </Label3>
                      </Block>
                    ) : (
                      <Block>
                        <Label3 $style={{ fontSize: '14px', lineHeight: '14px', textAlign: 'right', fontStyle: 'italic', fontWeight: 400 }}>Ikke tildelt</Label3>
                      </Block>
                    )}
                    {props.krav.etterlevelseChangeStamp?.lastModifiedDate && (
                      <Block width="100%" display="flex" justifyContent="flex-end">
                        <Paragraph4 $style={{ lineHeight: '19px', textAlign: 'right', marginTop: '0px', marginBottom: '0px', whiteSpace: 'nowrap' }}>
                          {'Sist utfylt: ' + moment(props.krav.etterlevelseChangeStamp?.lastModifiedDate).format('ll')}
                        </Paragraph4>
                      </Block>
                    )}
                  </Block>
                )}

                {props.krav.isIrrelevant && (
                  <Block marginLeft="31px" maxWidth="140px" width="100%">
                    <Label3 $style={{ fontSize: '14px', lineHeight: '14px', textAlign: 'right', fontStyle: 'italic', fontWeight: 400 }}>Bortfiltrert</Label3>
                  </Block>
                )}
              </Block>
            </Block>
          </Block>
        </Button>
      </Block>
      {!props.krav.isIrrelevant && etterlevelseMetadata && (
        <Block display="flex" alignItems="center" paddingRight={'8px'}>
          <TildeltPopoever
            etterlevelseMetadata={etterlevelseMetadata}
            setEtterlevelseMetadata={setEtterlevelseMetadata}
            icon={faEllipsisVertical}
            iconColor={ettlevColors.grey600}
          />
        </Block>
      )}
    </Block>
  )
}

const showWarningMessage = (warningMessage: string) => {
  return (
    <Block display="flex" alignItems="center">
      <img
        src={warningAlert}
        width="18px"
        height="18px"
        alt=""
        style={{
          marginLeft: '18px',
          marginRight: '5px',
        }}
      />
      <Paragraph4
        $style={{
          fontSize: '16px',
          lineHeight: '16px',
          fontStyle: 'italic',
          marginTop: '0px',
          marginBottom: '0px',
        }}
      >
        {warningMessage}
      </Paragraph4>
    </Block>
  )
}
