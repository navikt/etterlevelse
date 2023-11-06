import React from 'react'
import * as _ from 'lodash'
import { Heading, Skeleton } from '@navikt/ds-react'

export const LoadingSkeleton = (props: { header: string }) => (
  <div className="w-full">
    <div className="flex justify-between items-center w-full">
      <div className="flex w-full">
        <Heading level="1" size="medium" className="mr-2.5">{props.header}</Heading>
        <Skeleton height="40px" width="400px" />
      </div>
      <div className="flex">
        <Skeleton height="40px" width="40px" className="mr-2.5" />
        <Skeleton height="40px" width="40px" />
      </div>
    </div>
    <div className="max-w-xl">
      <SkeletonPanel count={12} />
    </div>
  </div>
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
