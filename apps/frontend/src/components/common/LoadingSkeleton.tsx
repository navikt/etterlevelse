import {Block} from 'baseui/block'
import {HeadingXLarge} from 'baseui/typography'
import {theme} from '../../util'
import {Skeleton} from 'baseui/skeleton'
import React from 'react'
import * as _ from 'lodash'
import {ettlevColors} from '../../util/theme'
import {borderRadius} from './Style'

export const LoadingSkeleton = (props: { header: string }) => (
  <Block width="100%">
    <Block display="flex" justifyContent="space-between" alignItems="center" width="100%">
      <HeadingXLarge display="flex" alignItems="center">
        {props.header}
        <Block marginRight={theme.sizing.scale400} />
        <Skeleton height={theme.sizing.scale1000} width="400px" animation />
      </HeadingXLarge>
      <Block display="flex">
        <Skeleton height={theme.sizing.scale1000} width="40px" animation />
        <Block marginRight={theme.sizing.scale400} />
        <Skeleton height={theme.sizing.scale1000} width="40px" animation />
      </Block>
    </Block>
    <Block maxWidth="600px">
      <Skeleton rows={12} animation />
    </Block>
  </Block>
)

export const SkeletonPanel = (props: { count: number }) => (
  <>
    {_.range(props.count).map((i) => (
      <Block key={i} marginBottom={'6px'}>
        <Skeleton
          height={'82px'}
          width={'100%'}
          animation
          overrides={{
            Root: {
              style: {
                border: '1px solid ' + ettlevColors.grey100,
                ...borderRadius('4px'),
                backgroundImage: `linear-gradient(135deg, #fff, #fff, #fff, #fff, #fff, #fff, ${ettlevColors.grey100}, #fff, #fff, #fff, #fff, #fff, #fff)`,
              },
            },
          }}
        />
      </Block>
    ))}
  </>
)
