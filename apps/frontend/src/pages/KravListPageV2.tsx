import { Block } from "baseui/block";
import { HeadingXXLarge } from "baseui/typography";
import { useState } from "react";
import Button from "../components/common/Button";
import CustomizedBreadcrumbs from "../components/common/CustomizedBreadcrumbs";
import CustomizedTabs from "../components/common/CustomizedTabs";
import RouteLink from "../components/common/RouteLink";
import { user } from "../services/User";
import { theme } from "../util";
import { ettlevColors, maxPageWidth } from "../util/theme";

type Section = 'siste' | 'alle'

export const KravListPage = () => (
  <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
    <Block width="100%" backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
      <Block maxWidth={maxPageWidth} width="100%">
        <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
          <CustomizedBreadcrumbs currentPage="Forvalte og opprette krav" />
          <HeadingXXLarge marginTop='0' >Forvalte og opprette krav</HeadingXXLarge>
        </Block>
        <Block paddingLeft={'100px'} paddingRight={'100px'} display="flex" justifyContent="flex-end">
            {user.isKraveier() && (
              <RouteLink hideUnderline href={'/krav/ny'}>
                <Button size="compact">Nytt krav</Button>
              </RouteLink>
            )}
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
          <KravTabs />
        </Block>

      </Block>
    </Block>
  </Block>
)

const KravTabs = () => {
  const [tab, setTab] = useState<Section>('siste')

  return (
    <CustomizedTabs
      fontColor={ettlevColors.green800}
      small
      backgroundColor={ettlevColors.grey25}
      activeKey={tab}
      onChange={(args) => setTab(args.activeKey as Section)}
      tabs={[
        {
          key: 'siste',
          title: 'Sist endret av meg',
          content: 'test',
        },
        {
          key: 'alle',
          title: 'Seksjonens krav',
          content: 'Seksjonens krav',
        }
      ]}
    />
  )
}