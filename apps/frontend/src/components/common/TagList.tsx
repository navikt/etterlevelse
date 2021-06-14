import * as React from 'react'
import {Tag, VARIANT} from 'baseui/tag'
import {theme} from '../../util'
import {ettlevColors, pageWidth} from '../../util/theme'

export const RenderTagList = ({
  list,
  onRemove,
  onClick,
  wide,
}: {
  list: React.ReactNode[]
  onRemove: (i: number) => void
  onClick?: (i: number) => void
  wide?: boolean
}) => {
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
                        maxWidth: wide ? undefined : pageWidth,
                        fontSize: theme.sizing.scale650,
                        lineHeight: theme.sizing.scale750,
                        fontWeight: 400,
                      },
                    },
                    Root: {
                      style: {
                        borderLeftWidth: '1px',
                        borderRightWidth: '1px',
                        borderBottomWidth: '1px',
                        borderTopWidth: '1px',
                        ':hover': {
                          backgroundColor: ettlevColors.green50,
                          borderColor: '#0B483F',
                        },
                      },
                    },
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
