import {Block} from 'baseui/block'
import {H2} from 'baseui/typography'
import {theme} from '../../util'
import {Skeleton} from 'baseui/skeleton'
import React from 'react'


export const LoadingSkeleton = (props: {header: string}) =>
  <Block width='100%'>
    <Block display='flex' justifyContent='space-between' alignItems='center' width='100%'>
      <H2 display='flex' alignItems='center'>

        {props.header}
        <Block marginRight={theme.sizing.scale400}/>
        <Skeleton height={theme.sizing.scale1000} width='400px' animation/>
      </H2>
      <Block display='flex'>
        <Skeleton height={theme.sizing.scale1000} width='40px' animation/>
        <Block marginRight={theme.sizing.scale400}/>
        <Skeleton height={theme.sizing.scale1000} width='40px' animation/>
      </Block>
    </Block>
    <Block maxWidth='600px'>
      <Skeleton rows={12} animation/>
    </Block>
  </Block>
