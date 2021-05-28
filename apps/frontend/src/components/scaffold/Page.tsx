import {Block} from 'baseui/block'
import {maxPageWidth, pageWidth, theme} from '../../util/theme'
import RouteLink from '../common/RouteLink'
import Button from '../common/Button'
import {navChevronRightIcon} from '../Images'
import React from 'react'


export const Page = ({backUrl, headerOverlap, headerBackgroundColor, backgroundColor, children, header}: {
  backUrl: string,
  headerOverlap?: string,
  headerBackgroundColor: string
  backgroundColor: string
  header: React.ReactNode, children: React.ReactNode
}) => {
  return (
    <Block width='100%' overrides={{Block: {props: {role: 'main'}}}} backgroundColor={backgroundColor} paddingBottom={'200px'}>

      <Block backgroundColor={headerBackgroundColor} display='flex' width='100%' justifyContent='center'
             paddingBottom={headerOverlap} marginBottom={headerOverlap ? '-' + headerOverlap : undefined}
      >
        <Block maxWidth={maxPageWidth} width='100%'>

          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            <RouteLink href={backUrl} hideUnderline>
              <Button startEnhancer={<img alt={'Chevron venstre ikon'} src={navChevronRightIcon} style={{transform: 'rotate(180deg)'}}/>} size='compact' kind='underline-hover'
              > Tilbake</Button>
            </RouteLink>

            <Block width={'100%'} display={'flex'} justifyContent='center'>
              <Block maxWidth={pageWidth} width={'100%'} display={'flex'} flexDirection={'column'} marginBottom={theme.sizing.scale600}>
                {header}
              </Block>
            </Block>
          </Block>
        </Block>
      </Block>

      <Block display='flex' width='100%' justifyContent='center'>
        <Block maxWidth={pageWidth} width={'100%'} marginTop={headerOverlap ? 0 : theme.sizing.scale800}>
          {children}
        </Block>
      </Block>

    </Block>
  )
}
