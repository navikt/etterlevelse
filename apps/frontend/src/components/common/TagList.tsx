import { Chips } from '@navikt/ds-react'

interface IProps {
  list: string[]
  onRemove: (i: number) => void
}

export const RenderTagList = ({ list, onRemove }: IProps) => (
  <Chips className="mt-2">
    {list?.length > 0 &&
      list.map((item, index) => (
        <div key={'tags_' + item + '_' + index}>
          {item && (
            <Chips.Removable variant="neutral" onClick={() => onRemove(index)}>
              {item}
            </Chips.Removable>
          )}
        </div>
      ))}
  </Chips>
)
