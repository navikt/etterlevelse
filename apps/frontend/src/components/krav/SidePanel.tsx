import { Block } from 'baseui/block'
import { LabelSmall } from 'baseui/typography'
import { useState } from 'react'
import { ettlevColors } from '../../util/theme'
import { Chevron } from '../common/PanelLink'
import RouteLink from '../common/RouteLink'
import { borderColor, borderStyle, borderWidth, padding } from '../common/Style'
import { arrowRightIcon } from '../Images'

export const SidePanel = () => {
  const [hover, setHover] = useState<boolean>(false)

  return (
    <RouteLink href="/behandlinger" hideUnderline onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Block
        marginLeft="24px"
        width="187px"
        display={['none', 'none', 'none', 'none', 'none', 'flex']}
      >
        <LabelSmall
          $style={{
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: '28px',
            textDecoration: hover ? 'underline' : 'none',
            display: 'flex'
          }}
        >
          Dokumentere etterlevelse
          <Chevron hover={hover} icon={arrowRightIcon} distance={'8px'} size={'20px'} />
        </LabelSmall>
      </Block>
    </RouteLink>
  )
}

export default SidePanel
