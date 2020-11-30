import * as React from "react"
import {Tag, VARIANT} from "baseui/tag"

export const RenderTagList = ({list, onRemove, wide}: {list: string[], onRemove: (i: number) => void, wide?: boolean}) => {
  return (
    <React.Fragment>
      {list && list.length > 0
        ? list.map((item, index) => (
          <React.Fragment key={index}>
            {item ? (
              <Tag
                key={item}
                variant={VARIANT.outlined}
                onActionClick={() => onRemove(index)}
                overrides={{
                  Text: {
                    style: {
                      maxWidth:undefined
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
  );
}
