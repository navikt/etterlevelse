import { Block } from 'baseui/block'
import { Label3 } from 'baseui/typography'
import { useState } from 'react'
import { ettlevColors } from '../../util/theme'
import { Chevron } from '../common/PanelLink'
import RouteLink from '../common/RouteLink'
import { borderColor, borderStyle, borderWidth, padding } from '../common/Style'
import { arrowRightIcon } from '../Images'


export const SidePanel = () => {
  const [hover, setHover] = useState<boolean>(false)

  return (
    <RouteLink
      href="/behandlinger"
      hideUnderline
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Block
        width="100%"
        $style={{
          ...borderWidth('1px'),
          ...borderColor('#E3E3E3'),
          ...borderStyle('solid'),
          ...padding('22px', '24px'),
          backgroundColor: ettlevColors.white,

        }}
      >
        <Label3
          $style={{
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: '28px',
            textDecoration: hover ? 'underline' : 'none'
          }}
        >
          Dokumenter Etterlevelse
        </Label3>
        <Block display="flex" justifyContent="flex-end" width="100%">
          <Chevron hover={hover} icon={arrowRightIcon} distance={'8px'} />
        </Block>
      </Block>
    </RouteLink>
  )
}

export default SidePanel