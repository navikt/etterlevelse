import { Heading, Skeleton } from '@navikt/ds-react'
import * as _ from 'lodash'

export const LoadingSkeleton = (props: { header: string }) => (
  <div className="w-full">
    <div className="flex justify-between items-center w-full">
      <div className="flex w-full">
        <Heading level="1" size="medium" className="mr-2.5">
          {props.header}
        </Heading>
        <Skeleton height="2.5rem" width="25rem" />
      </div>
      <div className="flex">
        <Skeleton height="2.5rem" width="2.5rem" className="mr-2.5" />
        <Skeleton height="2.5rem" width="2.5rem" />
      </div>
    </div>
    <div className="max-w-xl">
      <SkeletonPanel count={12} />
    </div>
  </div>
)

export const SkeletonPanel = (props: { count: number }) => (
  <div>
    {_.range(props.count).map((index) => (
      <div key={index} className="mb-1.5">
        <Skeleton variant="rectangle" width="100%" height="5.125rem" />
      </div>
    ))}
  </div>
)
