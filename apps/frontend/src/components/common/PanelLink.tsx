import React, {useState} from 'react'
import RouteLink from './RouteLink'
import {Block} from 'baseui/block'
import {borderRadius, paddingAll} from './Style'
import {theme} from '../../util'
import {ettlevColors} from '../../util/theme'
import {LabelLarge, LabelSmall, ParagraphSmall} from 'baseui/typography'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChevronRight} from '@fortawesome/free-solid-svg-icons'


export const PanelLink = ({href, title, rightTitle, beskrivelse, rightBeskrivelse, panelIcon}:
                            {
                              href: string, title: string, rightTitle?: string, beskrivelse?: string, rightBeskrivelse?: string,
                              panelIcon?: React.ReactNode | ((hover: boolean) => React.ReactNode)
                            }) => {
  const [hover, setHover] = useState(false)

  return (
    <RouteLink href={href} hideUnderline $style={{
      display: 'flex'
    }}>
      <Block overrides={{
        Block: {
          style: {
            width: '100%',
            ...paddingAll(theme.sizing.scale600),
            paddingLeft: theme.sizing.scale300,
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: ettlevColors.white,

            borderWidth: '1px',
            borderColor: ettlevColors.grey100,
            borderStyle: 'solid',
            ...borderRadius('4px'),

            ':hover': {
              position: 'relative',
              boxSizing: 'border-box',
              boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.12)'
            }
          }
        }
      }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {typeof panelIcon === 'function' ? panelIcon(hover) : panelIcon}

        <Block marginLeft={theme.sizing.scale300} marginRight={theme.sizing.scale600} $style={{flexGrow: 1}}
               display={'flex'} flexDirection={'column'} justifyContent={'center'}>
          <LabelLarge $style={{lineHeight: '20px'}}>{title}</LabelLarge>
          <ParagraphSmall marginBottom={0} marginTop={theme.sizing.scale100}>{beskrivelse}</ParagraphSmall>
        </Block>

        <Block minWidth={'120px'} maxWidth={'120px'} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
          {rightTitle && <LabelSmall>{rightTitle}</LabelSmall>}
          {rightBeskrivelse && <ParagraphSmall marginBottom={0} marginTop={rightTitle ? theme.sizing.scale100 : 0}>{rightBeskrivelse}</ParagraphSmall>}
        </Block>

        <Block marginLeft={hover ? `calc(${theme.sizing.scale600} + 4px)` : theme.sizing.scale600} alignSelf={'center'} marginRight={hover ? '-4px' : 0}>
          <FontAwesomeIcon icon={faChevronRight} size={'lg'} color={ettlevColors.green800}/>
        </Block>

      </Block>
    </RouteLink>
  )
}
