import { EtterlevelseMetadata, KRAV_FILTER_TYPE, KravEtterlevelseData } from '../../constants'
import { useEffect, useState } from 'react'
import { getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion, mapEtterlevelseMetadataToFormValue } from '../../api/EtterlevelseMetadataApi'
import { Block } from 'baseui/block'
import { ettlevColors } from '../../util/theme'
import { borderStyle, marginAll } from '../common/Style'
import { LabelSmall, ParagraphXSmall } from 'baseui/typography'
import StatusView from '../common/StatusTag'
import moment from 'moment'
import TildeltPopoever from '../etterlevelseMetadata/TildeltPopover'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { warningAlert } from '../Images'
import { getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber } from '../../api/EtterlevelseApi'
import { useLocation } from 'react-router-dom'
import { getNumberOfDaysBetween } from '../../util/checkAge'
import { getEtterlevelseStatus, getStatusLabelColor } from '../etterlevelseDokumentasjon/common/utils'
import RouteLink from '../common/RouteLink'

export const KravCard = (props: { krav: KravEtterlevelseData; noStatus?: boolean; etterlevelseDokumentasjonId: string; noVarsling?: boolean; kravFilter: KRAV_FILTER_TYPE }) => {
  const [nyVersionFlag, setNyVersionFlag] = useState<boolean>(false)
  const [hover, setHover] = useState(false)
  const location = useLocation()
  const [kravAge, setKravAge] = useState<number>(0)

  const [etterlevelseMetadata, setEtterlevelseMetadata] = useState<EtterlevelseMetadata>(
    mapEtterlevelseMetadataToFormValue({
      id: 'ny',
      etterlevelseDokumentasjonId: props.etterlevelseDokumentasjonId,
      kravNummer: props.krav.kravNummer,
      kravVersjon: props.krav.kravVersjon,
    }),
  )

  const getEtterlevelseMetaData = () => {
    getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion(props.etterlevelseDokumentasjonId, props.krav.kravNummer, props.krav.kravVersjon).then((resp) => {
      if (resp.content.length) {
        setEtterlevelseMetadata(resp.content[0])
      } else {
        setEtterlevelseMetadata(
          mapEtterlevelseMetadataToFormValue({
            id: 'ny',
            etterlevelseDokumentasjonId: props.etterlevelseDokumentasjonId,
            kravNummer: props.krav.kravNummer,
            kravVersjon: props.krav.kravVersjon,
          }),
        )
      }
    })
  }

  useEffect(() => {
    const today = new Date()
    const kravActivatedDate = moment(props.krav.aktivertDato).toDate()
    setKravAge(getNumberOfDaysBetween(kravActivatedDate, today))
    ;(async () => {
      getEtterlevelseMetaData()
      if (props.krav.kravVersjon > 1 && props.krav.etterlevelseStatus === undefined) {
        setNyVersionFlag((await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(props.etterlevelseDokumentasjonId, props.krav.kravNummer)).content.length >= 1)
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
          outlineWidth: '3px',
          outlineStyle: 'solid',
          outlinwColor: ettlevColors.focusOutline,
        },
      }}
    >
      <Block width="100%" paddingRight="24px" paddingTop="8px" paddingBottom="8px" paddingLeft="8px">
        <RouteLink
          href={location.pathname + '/krav/' + props.krav.kravNummer + '/' + props.krav.kravVersjon + '/'}
          hideUnderline
          $style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            backgroundColor: ettlevColors.white,
            ...borderStyle('hidden'),
            ':hover': { backgroundColor: 'none', boxShadow: '' },
            boxShadow: '',
          }}
        >
          <Block display="flex" justifyContent="center" alignItems="center" width="100%" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Block marginLeft="14px">
              <Block display={'flex'} alignItems={'center'}>
                <ParagraphXSmall
                  $style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '0px', marginTop: '0px', width: 'fit-content', textDecoration: hover ? 'underline' : 'none' }}
                >
                  K{props.krav.kravNummer}.{props.krav.kravVersjon}
                </ParagraphXSmall>
                {!props.noVarsling && props.krav.kravVersjon === 1 && props.krav.etterlevelseStatus === undefined && kravAge < 30 && (
                  <ShowWarningMessage warningMessage="Nytt krav" />
                )}
                {!props.noVarsling && props.krav.etterlevelseStatus === undefined && nyVersionFlag && props.kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && kravAge < 30 && (
                  <ShowWarningMessage warningMessage="Ny versjon" />
                )}
              </Block>
              <LabelSmall $style={{ fontSize: '18px', fontWeight: 600, alignContent: 'flex-start', textAlign: 'left', textDecoration: hover ? 'underline' : 'none' }}>
                {props.krav.navn}
              </LabelSmall>
            </Block>
            <Block display="flex" justifyContent="flex-end" flex="1" width="100%">
              <Block width="350px" display="flex" justifyContent="flex-end" marginLeft="32px">
                <Block display="flex" width="100%" maxWidth="220px" justifyContent="flex-end">
                  {props.kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && props.krav && props.krav.etterlevelseStatus && (
                    <StatusView
                      status={getEtterlevelseStatus(props.krav.etterlevelseStatus, props.krav.frist)}
                      statusDisplay={getStatusLabelColor(props.krav.etterlevelseStatus)}
                    />
                  )}
                </Block>

                {props.kravFilter !== KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                  <Block marginLeft="31px" maxWidth="140px" width="100%">
                    <StatusView
                      status={props.kravFilter === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV ? 'Bortfiltrert' : 'Utgått'}
                      statusDisplay={{
                        background: ettlevColors.grey50,
                        border: ettlevColors.grey200,
                      }}
                      overrides={{
                        Root: {
                          style: {
                            marginLeft: '21px',
                          },
                        },
                        Contents: {
                          style: {
                            ...marginAll('2px'),
                          },
                        },
                        Body: {
                          style: {
                            ...marginAll('2px'),
                            paddingRight: '8px',
                            paddingLeft: '8px',
                          },
                        },
                      }}
                    />
                  </Block>
                )}

                {!props.krav.isIrrelevant && (
                  <Block marginLeft="31px" maxWidth="140px" width="100%">
                    {etterlevelseMetadata && etterlevelseMetadata.tildeltMed && etterlevelseMetadata.tildeltMed.length >= 1 ? (
                      <Block>
                        <LabelSmall $style={{ fontSize: '14px', lineHeight: '14px', textAlign: 'right' }}>
                          Tildelt:{' '}
                          {etterlevelseMetadata.tildeltMed[0].length > 12 ? etterlevelseMetadata.tildeltMed[0].substring(0, 11) + '...' : etterlevelseMetadata.tildeltMed[0]}
                        </LabelSmall>
                      </Block>
                    ) : (
                      <Block>
                        <LabelSmall $style={{ fontSize: '14px', lineHeight: '14px', textAlign: 'right', fontStyle: 'italic', fontWeight: 400 }}>Ikke tildelt</LabelSmall>
                      </Block>
                    )}
                    {props.krav.etterlevelseChangeStamp?.lastModifiedDate && (
                      <Block width="100%" display="flex" justifyContent="flex-end">
                        <ParagraphXSmall $style={{ lineHeight: '19px', textAlign: 'right', marginTop: '0px', marginBottom: '0px', whiteSpace: 'nowrap' }}>
                          {'Sist utfylt: ' + moment(props.krav.etterlevelseChangeStamp?.lastModifiedDate).format('ll')}
                        </ParagraphXSmall>
                      </Block>
                    )}
                  </Block>
                )}
              </Block>
            </Block>
          </Block>
        </RouteLink>
      </Block>

      {props.kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && etterlevelseMetadata && (
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

export const ShowWarningMessage = ({ warningMessage, noMarginLeft }: { warningMessage: string; noMarginLeft?: boolean }) => {
  return (
    <Block display="flex" alignItems="center">
      <img
        src={warningAlert}
        width="18px"
        height="18px"
        alt="warning icon"
        style={{
          marginLeft: noMarginLeft ? undefined : '18px',
          marginRight: '5px',
        }}
      />
      <ParagraphXSmall
        $style={{
          fontSize: '16px',
          lineHeight: '16px',
          fontStyle: 'italic',
          marginTop: '0px',
          marginBottom: '0px',
        }}
      >
        {warningMessage}
      </ParagraphXSmall>
    </Block>
  )
}
