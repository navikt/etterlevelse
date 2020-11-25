import * as React from "react"
import {Tag, VARIANT} from "baseui/tag"

export function renderTagList(list: string[], onRemove: (i: number) => void) {
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
