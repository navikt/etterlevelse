import { Block } from 'baseui/block'
import Button from '../common/Button'
import { borderRadius, marginAll, paddingAll } from '../common/Style'
import { HeadingXXLarge, LabelSmall } from 'baseui/typography'
import { ettlevColors, maxPageWidth, responsivePaddingExtraLarge } from '../../util/theme'
import { angleIcon, page2Icon } from '../Images'
import CustomizedModal from '../common/CustomizedModal'
import { getTemaMainHeader } from '../../pages/TemaPage'
import React, { useState } from 'react'
import { EtterlevelseDokumentasjon } from '../../constants'
import { LovCode, TemaCode } from '../../services/Codelist'
import { KravId } from '../../api/KravApi'
import { useParams } from 'react-router-dom'
import { Section } from '../../pages/EtterlevelseDokumentasjonPage'

type EtterlevelseSecondaryHeaderProps = {
  tab: string
  setTab: React.Dispatch<React.SetStateAction<Section>>
  setNavigatePath: (state: string) => void
  etterlevelseDokumentasjon: EtterlevelseDokumentasjon | undefined
  temaData: TemaCode | undefined
  kravId: KravId | undefined
  lovListe: LovCode[]
}
export const EtterlevelseSecondaryHeader = ({ tab, setTab, setNavigatePath, etterlevelseDokumentasjon, temaData, lovListe, kravId }: EtterlevelseSecondaryHeaderProps) => {
  const [isTemaModalOpen, setIsTemaModalOpen] = useState<boolean>(false)
  const params = useParams<{ filter?: string }>()

  return (
    <Block width="100%">
      <Block marginTop="19px" width="fit-content">
        <Button
          kind="tertiary"
          onClick={() => {
            if (tab !== 'dokumentasjon') {
              setTab('dokumentasjon')
            }
            setNavigatePath('/dokumentasjon/' + etterlevelseDokumentasjon?.id)
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
          <LabelSmall
            $style={{
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '22px',
              color: ettlevColors.green600,
              textDecoration: 'underline',
              ':hover': {
                color: ettlevColors.green400,
              },
            }}
          >
            Tema for dokumentasjon
          </LabelSmall>
        </Button>
      </Block>

      <Block marginTop="8px">
        <img src={angleIcon} alt="angle icon" />{' '}
        <Button
          kind="tertiary"
          onClick={() => {
            if (tab !== 'dokumentasjon') {
              setTab('dokumentasjon')
            }
            setNavigatePath(`/dokumentasjon/${etterlevelseDokumentasjon?.id}`)
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
          <LabelSmall
            marginLeft="12px"
            $style={{
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '22px',
              color: ettlevColors.green600,
              textDecoration: 'underline',
              ':hover': {
                color: ettlevColors.green400,
              },
            }}
          >
            {temaData?.shortName}
          </LabelSmall>
        </Button>
      </Block>

      <Block marginTop="0px" marginBottom="56px" display="flex" width="calc(100% - 35px)" alignItems="center" justifyContent="center" marginLeft="35px">
        <Block display="flex" flex="1">
          <img src={angleIcon} alt="angle icon" />{' '}
          <LabelSmall marginLeft="12px" $style={{ fontSize: '24px', fontWeight: 900, lineHeight: '32px', color: ettlevColors.green600, whiteSpace: 'nowrap' }}>
            K{kravId?.kravNummer}.{kravId?.kravVersjon}
          </LabelSmall>
        </Block>

        <Block display="flex" justifyContent="flex-end" width="100%">
          <Button
            $style={{
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '22px',
              color: ettlevColors.green600,
              textUnderlineOffset: '2px',
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
            <Block
              paddingTop="120px"
              paddingBottom="40px"
              backgroundColor={ettlevColors.green100}
              paddingLeft={responsivePaddingExtraLarge}
              paddingRight={responsivePaddingExtraLarge}
            >
              <HeadingXXLarge marginTop="0px" marginBottom="0px">
                {temaData?.shortName}
              </HeadingXXLarge>
            </Block>
            <Block marginBottom="55px" marginTop="40px" paddingLeft={responsivePaddingExtraLarge} paddingRight={responsivePaddingExtraLarge}>
              <Block>{getTemaMainHeader(temaData, lovListe, true)}</Block>
              <Block display="flex" justifyContent="flex-end" width="100%" marginTop="38px">
                <Button onClick={() => setIsTemaModalOpen(false)}>Lukk visning</Button>
              </Block>
            </Block>
          </Block>
        </CustomizedModal>
      )}
    </Block>
  )
}
