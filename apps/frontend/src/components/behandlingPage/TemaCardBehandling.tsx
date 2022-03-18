import { codelist, TemaCode } from '../../services/Codelist'
import { Behandling } from '../../constants'
import { PanelLinkCard, PanelLinkCardOverrides } from '../common/PanelLink'
import { ettlevColors, theme } from '../../util/theme'
import { cardWidth, useKravCounter } from '../../pages/TemaPage'
import { Block } from 'baseui/block'
import { Paragraph4 } from 'baseui/typography'
import { ProgressBar, SIZE } from 'baseui/progress-bar'
import React from 'react'
import { HeaderContent } from './HeaderContent'
import { isFerdigUtfylt } from '../../pages/BehandlingerTemaPageV2'

type TemaCardBehandlingProps = {
  tema: TemaCode;
  stats: any[];
  behandling: Behandling;
  irrelevant?: boolean
}
export const TemaCardBehandling = (props: TemaCardBehandlingProps) => {
  const { tema, stats, behandling, irrelevant } = props
  const lover = codelist.getCodesForTema(tema.code)
  const lovcodes = lover.map((c) => c.code)
  const krav = stats.filter((k) => k.regelverk.map((r: any) => r.lov.code).some((r: any) => lovcodes.includes(r)))
  const { data, loading } = useKravCounter({ lover: lover.map((c) => c.code) }, { skip: !lover.length })

  let nyttKravCounter = 0
  let nyttKravVersjonCounter = 0

  let utfylt = 0
  let underArbeid = 0
  let tilUtfylling = 0

  krav.forEach((k) => {
    if (k.etterlevelser.length === 0 && k.kravVersjon === 1) {
      nyttKravCounter += 1
    } if (k.etterlevelser.length === 0 && k.kravVersjon > 1 && krav.filter((kl) => kl.kravNummer === k.kravNummer && kl.etterlevelser.length > 0).length > 0) {
      nyttKravVersjonCounter += 1
    }
    if (k.etterlevelser.length && isFerdigUtfylt(k.etterlevelser[0].status)) {
      utfylt += 1
    } else if (
      k.etterlevelser.length && !isFerdigUtfylt(k.etterlevelser[0].status)) {
      underArbeid += 1
    } else {
      tilUtfylling += 1
    }
  })


  for (let index = krav.length - 1; index > 0; index--) {
    if (krav[index].kravNummer === krav[index - 1].kravNummer) {
      krav.splice(index - 1, 1)
    }
  }

  const overrides: PanelLinkCardOverrides = {
    Header: {
      Block: {
        style: {
          backgroundColor: krav.length > 0 ? ettlevColors.green100 : ettlevColors.green50,
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
          display: 'block',
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
      headerContent={<HeaderContent kravLength={krav.length} documentedLength={underArbeid + utfylt} nyttKravCounter={nyttKravCounter} nyttKravVersjonCounter={nyttKravVersjonCounter} />}
      flexContent
      hideArrow
      titleColor={ettlevColors.green600}
    >
      <Block display="flex" width="100%">
        {krav.length > 0 ?
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
          :
          <Paragraph4 $style={{ lineHeight: '14px', fontStyle: 'italic' }} marginTop="25px" marginBottom="0px">
            Tema inneholder {data?.krav.numberOfElements} krav dere har filtrert bort
          </Paragraph4>
        }
      </Block>
    </PanelLinkCard>
  )
}
