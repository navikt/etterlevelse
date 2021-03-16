import * as React from 'react'
import {Tag, VARIANT} from 'baseui/tag'
import {theme} from '../../util'

export const RenderTagList = ({list, onRemove, onClick, wide}: {list: React.ReactNode[], onRemove: (i: number) => void, onClick?: (i: number) => void, wide?: boolean}) => {
  return (
    <React.Fragment>
      {list && list.length > 0
        ? list.map((item, index) => (
          <React.Fragment key={index}>
            {item ? (
              <Tag
                key={index}
                variant={VARIANT.outlined}
                onClick={onClick ? () => onClick(index) : undefined}
                onActionClick={() => onRemove(index)}
                overrides={{
                  Text: {
                    style: {
                      maxWidth: wide ? undefined : theme.sizing.scale4800
                    }
                  }
                }}
              >
                {item}
              </Tag>
            ) : null}
          </React.Fragment>
        ))
        : null}
    </React.Fragment>
  )
}
