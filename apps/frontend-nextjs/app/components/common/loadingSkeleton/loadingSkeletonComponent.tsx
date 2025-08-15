import { ContentLayout } from '@/components/others/layout/content/content'
import { Heading, Skeleton } from '@navikt/ds-react'
import * as _ from 'lodash'

export const LoadingSkeleton = (props: { header: string }) => {
  const { header } = props

  return (
    <div className='w-full'>
      <div className='flex justify-between items-center w-full'>
        <ContentLayout>
          <Heading level='1' size='medium' className='mr-2.5'>
            {header}
          </Heading>
          <Skeleton height='2.5rem' width='25rem' />
        </ContentLayout>
        <div className='flex'>
          <Skeleton height='2.5rem' width='2.5rem' className='mr-2.5' />
          <Skeleton height='2.5rem' width='2.5rem' />
        </div>
      </div>
      <div className='max-w-xl'>
        <SkeletonPanel count={12} />
      </div>
    </div>
  )
}

export const SkeletonPanel = (props: { count: number }) => {
  const { count } = props

  return (
    <div>
      {_.range(count).map((index: number) => (
        <div key={index} className='mb-1.5'>
          <Skeleton variant='rectangle' width='100%' height='5.125rem' />
        </div>
      ))}
    </div>
  )
}
