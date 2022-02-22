import {Helmet} from "react-helmet";
import {Block} from "baseui/block";
import {ettlevColors, maxPageWidth, theme} from "../util/theme";
import CustomizedBreadcrumbs from "../components/common/CustomizedBreadcrumbs";
import {HeadingXXLarge} from "baseui/typography";
import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import CustomizedTabs from "../components/common/CustomizedTabs";

type Section = 'utsendtMelding' | 'systemMelding' | 'forsidenMelding'

export const VarselPage = () => {
  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Varslinger</title>
      </Helmet>
      <Block width="100%" backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            {/* <RouteLink hideUnderline>
            <Button startEnhancer={<img alt={'Chevron venstre ikon'} src={navChevronRightIcon} style={{ transform: 'rotate(180deg)' }} />} size="compact" kind="tertiary">
              {' '}
              Tilbake
            </Button>
          </RouteLink> */}
            <CustomizedBreadcrumbs currentPage="Varslinger" />
            <HeadingXXLarge marginTop="0">Varslinger</HeadingXXLarge>
          </Block>
        </Block>
      </Block>

      <Block
        display={'flex'}
        justifyContent="center"
        width="100%"
        $style={{
          background: `linear-gradient(top, ${ettlevColors.grey50} 80px, ${ettlevColors.grey25} 0%)`,
        }}
      >
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            <BehandlingTabs />
          </Block>
        </Block>
      </Block>
    </Block>
  )
}

const BehandlingTabs = () => {
  const params = useParams<{ tab?: Section }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Section>(params.tab || 'utsendtMelding')
  const [doneLoading, setDoneLoading] = useState(false)


  return (
    <CustomizedTabs
      fontColor={ettlevColors.green800}
      small
      backgroundColor={ettlevColors.grey25}
      activeKey={tab}
      onChange={(args) => setTab(args.activeKey as Section)}
      tabs={[
        {
          key: 'utsendtMelding',
          title: 'Utsendte meldinger',
          content: <>Hello</>,
        },
        {
          key: 'systemMelding',
          title: 'Systemmelding',
          content: <>From the other side</>,
        },
        {
          key: 'forsideMelding',
          title: 'Informasjon på forsiden',
          content: <>Bye</>,
        },
      ]}
    />
  )
}

