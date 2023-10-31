import {EtterlevelseMetadata, KRAV_FILTER_TYPE, KravEtterlevelseData} from '../../constants'
import {useEffect, useState} from 'react'
import {getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion, mapEtterlevelseMetadataToFormValue} from '../../api/EtterlevelseMetadataApi'
import {Block} from 'baseui/block'
import {ettlevColors} from '../../util/theme'
import {borderStyle} from '../common/Style'
import {LabelSmall, ParagraphXSmall} from 'baseui/typography'
import StatusView from '../common/StatusTag'
import moment from 'moment'
import TildeltPopoever from '../etterlevelseMetadata/TildeltPopover'
import {faEllipsisVertical} from '@fortawesome/free-solid-svg-icons'
import {warningAlert} from '../Images'
import {getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber} from '../../api/EtterlevelseApi'
import {getNumberOfDaysBetween} from '../../util/checkAge'
import {getEtterlevelseStatus, getStatusLabelColor} from '../etterlevelseDokumentasjon/common/utils'
import RouteLink from '../common/RouteLink'
import { BodyShort, Detail, Link, LinkPanel } from '@navikt/ds-react'

export const KravCard = (props: { krav: KravEtterlevelseData; noStatus?: boolean; etterlevelseDokumentasjonId: string; noVarsling?: boolean; kravFilter: KRAV_FILTER_TYPE; temaCode?: string }) => {
  const [nyVersionFlag, setNyVersionFlag] = useState<boolean>(false)
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

  if (props.krav.kravNummer === 102) {
    console.log(props.krav)
  }
  
  return (
        <LinkPanel 
          className="w-full"
          href={`/dokumentasjon/${props.etterlevelseDokumentasjonId}/${props.temaCode}/RELEVANTE_KRAV/krav/${props.krav.kravNummer}/${props.krav.kravVersjon}/`}
        >
          <div>
            <div>
              <div>
                {!props.noVarsling && props.krav.kravVersjon === 1 && props.krav.etterlevelseStatus === undefined && kravAge < 30 && (
                  <ShowWarningMessage warningMessage="Nytt krav" />
                )}
                {!props.noVarsling && props.krav.etterlevelseStatus === undefined && nyVersionFlag && props.kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && kravAge < 30 && (
                  <ShowWarningMessage warningMessage="Ny versjon" />
                )}
              </div>
              <strong>K{props.krav.kravNummer}.{props.krav.kravVersjon}</strong> – {props.krav.navn} 
            </div>
            <div>
              <div>
                <div>
                  {props.kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && props.krav && props.krav.etterlevelseStatus && (
                    <StatusView
                      status={getEtterlevelseStatus(props.krav.etterlevelseStatus, props.krav.frist)}
                      variant={getStatusLabelColor(props.krav.etterlevelseStatus)}
                    />
                  )}
                </div>

                {props.kravFilter !== KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                  <Block marginLeft="31px" maxWidth="140px" width="100%">
                    <StatusView status={props.kravFilter === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV ? 'Bortfiltrert' : 'Utgått'}/>
                  </Block>
                )}

                {!props.krav.isIrrelevant && (
                  <div>
                    {etterlevelseMetadata && etterlevelseMetadata.tildeltMed && etterlevelseMetadata.tildeltMed.length >= 1 && (
                      <Detail className="whitespace-nowrap">
                          Tildelt: {etterlevelseMetadata.tildeltMed[0].length > 12 ? etterlevelseMetadata.tildeltMed[0].substring(0, 11) + '...' : etterlevelseMetadata.tildeltMed[0]}
                      </Detail>
                    )}
                    {props.krav.etterlevelseChangeStamp?.lastModifiedDate && (
                      <Detail className="whitespace-nowrap">
                        {'Sist utfylt: ' + moment(props.krav.etterlevelseChangeStamp?.lastModifiedDate).format('ll')}
                      </Detail>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </LinkPanel>
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
