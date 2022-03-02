import {Helmet} from "react-helmet";
import {Block} from "baseui/block";
import {ettlevColors, maxPageWidth, theme} from "../util/theme";
import CustomizedBreadcrumbs from "../components/common/CustomizedBreadcrumbs";
import {HeadingXXLarge} from "baseui/typography";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import CustomizedTabs from "../components/common/CustomizedTabs";
import EditMelding from "../components/varslinger/EditMelding";
import {AlertType, Melding, MeldingStatus, MeldingType} from "../constants";
import {getMeldingByType, mapMeldingToFormValue} from "../api/MeldingApi";
import { ObjectType } from "../components/admin/audit/AuditTypes";
import { AuditRecentTable } from "../components/admin/audit/AuditRecentTable";
import { ampli } from "../services/Amplitude";

ampli.logEvent('sidevisning', { sidetittel: 'VarselPage' })


type Section = 'utsendtMelding' | MeldingType.SYSTEM | MeldingType.FORSIDE

export const VarselPage = () => {
  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{Block: {props: {role: 'main'}}}}>
      <Helmet>
        <meta charSet="utf-8"/>
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
            <CustomizedBreadcrumbs currentPage="Varslinger"/>
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
            <VarselTabs/>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}

const VarselTabs = () => {
  const params = useParams<{ tab?: Section }>()

  const [tab, setTab] = useState<Section>(params.tab || 'utsendtMelding')
  const [isLoading, setLoading] = useState<boolean>(false)
  const [melding, setMelding] = useState<Melding>(mapMeldingToFormValue({}))

  useEffect(() => {
    (async () => {
      setLoading(true)
      if (tab !== 'utsendtMelding') {
        const response = await getMeldingByType(tab === 'SYSTEM' ? MeldingType.SYSTEM : MeldingType.FORSIDE)
        if (response.numberOfElements > 0) {
          setMelding(response.content[0])
        }
      }
      setLoading(false)
    })()
  }, [tab])

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
          content: <AuditRecentTable show={true} tableType={ObjectType.Melding}/>,
        },
        {
          key: MeldingType.SYSTEM,
          title: 'Systemmelding',
          content:<EditMelding melding={melding} setMelding={setMelding} isLoading={isLoading}/>,
        },
        {
          key: MeldingType.FORSIDE,
          title: 'Informasjon på forsiden',
          content:<EditMelding melding={melding} setMelding={setMelding} isLoading={isLoading} maxChar={500}/>,
        },
      ]}
    />
  )
}

