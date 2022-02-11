import { Block } from "baseui/block";
import Button from "../common/Button";
import { borderRadius, marginAll, paddingAll } from "../common/Style";
import { H1, Label3 } from "baseui/typography";
import { ettlevColors, maxPageWidth, responsivePaddingExtraLarge } from "../../util/theme";
import { angleIcon, page2Icon } from "../Images";
import CustomizedModal from "../common/CustomizedModal";
import { getTemaMainHeader } from "../../pages/TemaPage";
import React from "react";
import { isFerdigUtfylt, Section } from "../../pages/BehandlingerTemaPageV2";
import { NavigateFunction } from "react-router-dom";
import { Behandling, EtterlevelseStatus } from "../../constants";
import { LovCode, TemaCode } from "../../services/Codelist";

type SecondaryHeaderProps = {
  tab: string
  setTab: React.Dispatch<React.SetStateAction<Section>>
  edit: string | undefined
  setEdit: (edit: string | undefined) => void
  setIsAlertUnsavedModalOpen: (state: boolean) => void
  setIsTemaModalOpen: (state: boolean) => void
  setIsNavigateButtonClicked: (state: boolean) => void
  navigate: NavigateFunction
  behandling: Behandling | undefined
  temaData: TemaCode | undefined
  activeEtterlevleseStatus: EtterlevelseStatus | undefined
  isTemaModalOpen: boolean,
  lovListe: LovCode[]
}
export const SecondaryHeader = ({
  tab,
  setTab,
  edit,
  setEdit,
  setIsAlertUnsavedModalOpen,
  setIsNavigateButtonClicked,
  navigate,
  behandling,
  temaData,
  setIsTemaModalOpen,
  activeEtterlevleseStatus,
  isTemaModalOpen,
  lovListe,
}: SecondaryHeaderProps) => (
  <Block width="100%">
    <Block marginTop="19px" width="fit-content">
      <Button
        kind="tertiary"
        onClick={() => {
          if (tab !== 'dokumentasjon') {
            setTab('dokumentasjon')
          }
          if (edit) {
            setIsAlertUnsavedModalOpen(true)
            setIsNavigateButtonClicked(true)
          } else {
            setEdit(undefined)
            navigate(`/behandling/${behandling?.id}`)
          }
        }}
        $style={{
          ...paddingAll('0px'),
          ':hover': {
            backgroundColor: 'inherit',
          },
          ':focus': {
            backgroundColor: 'inherit',
          },
        }}
      >
        <Label3
          $style={{
            fontSize: '18px',
            fontWeight: 'normal',
            lineHeight: '22px',
            color: ettlevColors.green600, textDecoration: 'underline',
            ':hover': {
              color: ettlevColors.green400
            }
          }}>
          Krav til utfylling
        </Label3>
      </Button>
    </Block>
    {edit && (
      <Block marginTop="8px">
        <img src={angleIcon} alt="" />{' '}
        <Button
          kind="tertiary"
          onClick={() => {
            if (tab !== 'dokumentasjon') {
              setTab('dokumentasjon')
            }
            if (edit) {
              setIsAlertUnsavedModalOpen(true)
            } else {
              setEdit(undefined)
            }
          }}
          $style={{
            ...paddingAll('0px'),
            ':hover': {
              backgroundColor: 'inherit',
            },
            ':focus': {
              backgroundColor: 'inherit',
            },
          }}
        >
          <Label3
            marginLeft="12px"
            $style={{
              fontSize: '18px',
              fontWeight: 'normal',
              lineHeight: '22px',
              color: ettlevColors.green600, textDecoration: 'underline',
              ':hover': {
                color: ettlevColors.green400
              }
            }}>
            {temaData?.shortName}
          </Label3>
        </Button>
      </Block>
    )}
    <Block
      marginTop="0px"
      marginBottom="56px"
      display="flex"
      width={edit ? 'calc(100% - 35px)' : '100%'}
      alignItems="center"
      justifyContent="center"
      marginLeft={edit ? '35px' : '0px'}
    >
      <Block display="flex" flex="1">
        <img src={angleIcon} alt="" />{' '}
        <Label3 marginLeft="12px" $style={{ fontSize: '18px', fontWeight: 600, lineHeight: '22px', color: ettlevColors.green600, whiteSpace: 'nowrap' }}>
          {edit ? (isFerdigUtfylt(activeEtterlevleseStatus) ? 'Ferdig utfylt' : 'Skal fylles ut') : temaData?.shortName}
        </Label3>
      </Block>
      <Block display="flex" justifyContent="flex-end" width="100%">
        <Button
          startEnhancer={<img src={page2Icon} alt="Om personvern og ansvarlig for tema" />}
          size="compact"
          $style={{
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '22px',
            color: ettlevColors.green600,
            ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' },
          }}
          kind={'tertiary'}
          onClick={() => setIsTemaModalOpen(true)}
          marginLeft
        >
          Om {temaData?.shortName.toLocaleLowerCase()} og ansvarlig for tema
        </Button>
      </Block>
    </Block>
    {temaData && (
      <CustomizedModal
        onClose={() => setIsTemaModalOpen(false)}
        isOpen={isTemaModalOpen}
        size="full"
        overrides={{
          Dialog: {
            style: {
              ...borderRadius('0px'),
              ...marginAll('0px'),
              width: '100%',
              maxWidth: maxPageWidth,
            },
          },
        }}
      >
        <Block width="100%">
          <Block paddingTop="120px" paddingBottom="40px" backgroundColor={ettlevColors.green100} paddingLeft={responsivePaddingExtraLarge}
            paddingRight={responsivePaddingExtraLarge}>
            <H1 marginTop="0px" marginBottom="0px">
              {temaData?.shortName}
            </H1>
          </Block>
          <Block marginBottom="55px" marginTop="40px" paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
            <Block>{getTemaMainHeader(temaData, lovListe, true, () => {
            }, true, true)}</Block>
            <Block display="flex" justifyContent="flex-end" width="100%" marginTop="38px">
              <Button onClick={() => setIsTemaModalOpen(false)}>Lukk visning</Button>
            </Block>
          </Block>
        </Block>
      </CustomizedModal>
    )}
  </Block>
)
