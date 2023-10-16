import { Block } from 'baseui/block'
import { LabelSmall } from 'baseui/typography'
import { useState } from 'react'
import { Chevron } from '../common/PanelLink'
import RouteLink from '../common/RouteLink'
import { arrowRightIcon } from '../Images'

export const SidePanel = () => {
  const [hover, setHover] = useState<boolean>(false)

  return (
    <RouteLink href="/dokumentasjoner" hideUnderline onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Block marginLeft="24px" width="187px" display="flex">
        <Block width="120px">
          <LabelSmall
            $style={{
              fontSize: '20px',
              fontWeight: 600,
              lineHeight: '28px',
              textDecoration: hover ? 'underline' : 'none',
              display: 'flex',
            }}
          >
            Dokumentere etterlevelse
          </LabelSmall>
        </Block>
        <Chevron marginLeft="12px" hover={hover} icon={arrowRightIcon} distance={'8px'} size={'20px'} />
      </Block>
    </RouteLink>
  )
}

export default SidePanel
