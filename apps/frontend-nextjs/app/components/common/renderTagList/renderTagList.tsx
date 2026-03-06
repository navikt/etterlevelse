import { Chips } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  list: string[]
  onRemove?: (remove: number) => void
}

export const RenderTagList: FunctionComponent<TProps> = ({ list, onRemove }) => (
  <Chips className='mt-2'>
    {list?.length > 0 &&
      list.map((item: string, index: number) => (
        <div key={`tags_${item}_${index}`}>
          {item &&
            (onRemove ? (
              <Chips.Removable variant='neutral' onClick={() => onRemove(index)}>
                {item}
              </Chips.Removable>
            ) : (
              <Chips.Toggle variant='neutral' selected>
                {item}
              </Chips.Toggle>
            ))}
        </div>
      ))}
  </Chips>
)
