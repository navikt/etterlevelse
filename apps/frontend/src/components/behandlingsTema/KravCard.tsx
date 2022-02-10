import { EtterlevelseMetadata, KravEtterlevelseData } from "../../constants";
import React, { useEffect, useState } from "react";
import { getEtterlevelseMetadataByBehandlingsIdAndKravNummerAndKravVersion, mapEtterlevelseMetadataToFormValue, useEtterlevelseMetadata } from "../../api/EtterlevelseMetadataApi";
import { Block } from "baseui/block";
import Button from "../common/Button";
import { ettlevColors } from "../../util/theme";
import { borderStyle } from "../common/Style";
import { toKravId } from "./utils";
import { Label3, Paragraph4 } from "baseui/typography";
import StatusView from "../common/StatusTag";
import { getEtterlevelseStatus, getEtterlevelseStatusLabelColor } from "../behandling/utils";
import moment from "moment";
import TildeltPopoever from "../etterlevelseMetadata/TildeltPopover";
import { isFerdigUtfylt } from "../../pages/BehandlingerTemaPageV2";

export const KravCard = (props: { krav: KravEtterlevelseData; setEdit: Function; setKravId: Function; noStatus?: boolean; setActiveEtterlevelseStatus: Function, behandlingId: string }) => {
  const ferdigUtfylt = isFerdigUtfylt(props.krav.etterlevelseStatus)
  const [hover, setHover] = useState(false)
  const [etterlevelseMetadata, setEtterlevelseMetadata] = useState<EtterlevelseMetadata>(mapEtterlevelseMetadataToFormValue({
    id: 'ny',
    behandlingId: props.behandlingId,
    kravNummer: props.krav.kravNummer,
    kravVersjon: props.krav.kravVersjon,
  }))

  useEffect(() => {
    ; (async () => {
      getEtterlevelseMetadataByBehandlingsIdAndKravNummerAndKravVersion(props.behandlingId, props.krav.kravNummer, props.krav.kravVersjon)
        .then((resp) => {
          if (resp.content.length) {
            setEtterlevelseMetadata(resp.content[0])
          }
        })
    })()
  }, [])

  return (
    <Block display={'flex'}>
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
            ':hover': { backgroundColor: 'none' },
          }}
          onClick={() => {
            if (!props.krav.etterlevelseId) {
              props.setKravId(toKravId(props.krav))
              props.setEdit('ny')
              props.setActiveEtterlevelseStatus(undefined)
            } else {
              props.setActiveEtterlevelseStatus(props.krav.etterlevelseStatus)
              props.setEdit(props.krav.etterlevelseId)
            }
          }}
        >
          <Block display="flex" justifyContent="center" alignItems="center" width="100%" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Block marginLeft="24px">
              <Paragraph4
                $style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '0px', marginTop: '0px', width: 'fit-content', textDecoration: hover ? 'underline' : 'none' }}>
                K{props.krav.kravNummer}.{props.krav.kravVersjon}
              </Paragraph4>
              <Label3 $style={{ fontSize: '18px', fontWeight: 600, alignContent: 'flex-start', textAlign: 'left', textDecoration: hover ? 'underline' : 'none' }}>
                {props.krav.navn}
              </Label3>
            </Block>
            <Block display="flex" justifyContent="flex-end" flex="1" width="100%">
              <Block width="350px" display="flex" justifyContent="flex-end" marginLeft="32px">
                <Block display="flex" width="100%" maxWidth="220px" justifyContent="flex-end">
                  <StatusView
                    status={props.krav && props.krav.etterlevelseStatus ? getEtterlevelseStatus(props.krav) : 'Ikke påbegynt'}
                    statusDisplay={getEtterlevelseStatusLabelColor(props.krav)}
                    background={props.krav.varselMelding ? ettlevColors.white : undefined}
                  />
                </Block>
                <Block marginLeft="31px" maxWidth="140px" width="100%">
                  {etterlevelseMetadata && etterlevelseMetadata.tildeltMed && etterlevelseMetadata.tildeltMed.length >= 1 &&
                    <Block>
                      <Label3
                        $style={{ fontSize: '14px', lineHeight: '14px', textAlign: 'right' }}
                      >
                        Tildelt: {etterlevelseMetadata.tildeltMed[0].length > 12 ? etterlevelseMetadata.tildeltMed[0].substring(0, 11) + '...' : etterlevelseMetadata.tildeltMed[0]}
                      </Label3>
                    </Block>
                  }
                  <Block width="100%" display="flex" justifyContent="flex-end">
                    <Paragraph4 $style={{ lineHeight: '19px', textAlign: 'right', marginTop: '0px', marginBottom: '0px', whiteSpace: 'nowrap' }}>
                      {props.krav.etterlevelseChangeStamp?.lastModifiedDate ?
                        'Sist utfylt: ' + moment(props.krav.etterlevelseChangeStamp?.lastModifiedDate).format('ll') :
                        'Ikke påbegynt'
                      }
                    </Paragraph4>
                  </Block>
                </Block>
              </Block>
            </Block>
          </Block>
        </Button>
      </Block>
      {etterlevelseMetadata && <Block>
        <TildeltPopoever etterlevelseMetadata={etterlevelseMetadata} setEtterlevelseMetadata={setEtterlevelseMetadata}/>
      </Block>}
    </Block>
  )
}
