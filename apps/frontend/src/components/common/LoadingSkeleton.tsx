import { Block } from 'baseui/block'
import { HeadingXLarge } from 'baseui/typography'
import { theme } from '../../util'
import React from 'react'
import * as _ from 'lodash'
import { Skeleton } from '@navikt/ds-react'

export const LoadingSkeleton = (props: { header: string }) => (
  <Block width="100%">
    <Block display="flex" justifyContent="space-between" alignItems="center" width="100%">
      <HeadingXLarge display="flex" alignItems="center">
        {props.header}
        <Block marginRight={theme.sizing.scale400} />
        <Skeleton height={theme.sizing.scale1000} width="400px" />
      </HeadingXLarge>
      <Block display="flex">
        <Skeleton height={theme.sizing.scale1000} width="40px" />
        <Block marginRight={theme.sizing.scale400} />
        <Skeleton height={theme.sizing.scale1000} width="40px" />
      </Block>
    </Block>
    <Block maxWidth="600px">
      <SkeletonPanel count={12} />
    </Block>
  </Block>
)

export const SkeletonPanel = (props: { count: number }) => (
  <>
    {_.range(props.count).map((i) => (
      <div key={i} className="mb-1.5">
        <Skeleton variant="rectangle" width="100%" height="82px" />
      </div>
    ))}
  </>
)
