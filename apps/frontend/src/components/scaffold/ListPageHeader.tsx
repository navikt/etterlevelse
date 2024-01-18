import { Heading } from '@navikt/ds-react'

interface IProps {
  headingText: string
  children: React.ReactNode
}

export const ListPageHeader = (props: IProps) => {
  const { headingText, children } = props

  return (
    <div className="w-full flex justify-center">
      <div className="w-full">
        <div>
          <div className="flex">
            <div className="flex-1">
              <Heading size="medium">{headingText}</Heading>
            </div>

            <div className="flex justify-end">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
