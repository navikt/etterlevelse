import {codelist, TemaCode} from "../../services/Codelist";
import {Behandling} from "../../constants";
import {PanelLinkCard, PanelLinkCardOverrides} from "../common/PanelLink";
import {ettlevColors, theme} from "../../util/theme";
import {cardWidth} from "../../pages/TemaPage";
import {Block} from "baseui/block";
import {Paragraph4} from "baseui/typography";
import {ProgressBar, SIZE} from "baseui/progress-bar";
import React from "react";
import {HeaderContent} from "./HeaderContent";
import {isFerdigUtfylt} from "../../pages/BehandlingerTemaPageV2";

type TemaCardBehandlingProps = {
  tema: TemaCode;
  stats: any[];
  behandling: Behandling;
  irrelevant?: boolean
}
export const TemaCardBehandling = (props: TemaCardBehandlingProps) => {
  const {tema, stats, behandling, irrelevant} = props
  const lover = codelist.getCodesForTema(tema.code).map((c) => c.code)
  const krav = stats.filter((k) => k.regelverk.map((r: any) => r.lov.code).some((r: any) => lover.includes(r)))

  let utfylt = 0
  let underArbeid = 0
  let tilUtfylling = 0

  krav.forEach((k) => {
    if (k.etterlevelser.length && isFerdigUtfylt(k.etterlevelser[0].status)) {
      utfylt += 1
    } else if (
      k.etterlevelser.length && !isFerdigUtfylt(k.etterlevelser[0].status)) {
      underArbeid += 1
    } else {
      tilUtfylling += 1
    }
  })

  const overrides: PanelLinkCardOverrides = {
    Header: {
      Block: {
        style: {
          backgroundColor: ettlevColors.green100,
          height: '180px',
          paddingBottom: theme.sizing.scale600,
        },
      },
    },
    Content: {
      Block: {
        style: {
          maskImage: `linear-gradient(${ettlevColors.black} 90%, transparent)`,
          overflow: 'hidden',
        },
      },
    },
    Root: {
      Block: {
        style: {
          display: !krav.length ? 'none' : 'block',
        },
      },
    },
  }

  return (
    <PanelLinkCard
      width={cardWidth}
      overrides={overrides}
      verticalMargin={theme.sizing.scale400}
      href={`/behandling/${behandling.id}/${irrelevant ? 'i' : ''}${tema.code}`}
      tittel={tema.shortName}
      headerContent={<HeaderContent kravLength={krav.length}/>}
      flexContent
      hideArrow
      titleColor={ettlevColors.green600}
    >
      <Block marginTop={theme.sizing.scale650} width={'100%'}>
        <Block display="flex" flex={1}>
          <Paragraph4 marginTop="0px" marginBottom="2px">
            Ferdig utfylt:
          </Paragraph4>
          <Block display="flex" flex={1} justifyContent="flex-end">
            <Paragraph4 marginTop="0px" marginBottom="2px">
              {utfylt} av {krav.length} krav
            </Paragraph4>
          </Block>
        </Block>
        <Block>
          <ProgressBar
            value={utfylt}
            successValue={krav.length}
            size={SIZE.medium}
            overrides={{
              BarProgress: {
                style: {
                  backgroundColor: ettlevColors.green800,
                },
              },
              BarContainer: {
                style: {
                  marginLeft: '0px',
                  marginRight: '0px',
                },
              },
            }}
          />
        </Block>
      </Block>
    </PanelLinkCard>
  )
}
