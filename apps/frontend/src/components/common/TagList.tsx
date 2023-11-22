import { Chips } from '@navikt/ds-react'

export const RenderTagList = ({ list, onRemove }: { list: string[]; onRemove: (i: number) => void }) => {
  return (
    <Chips className="mt-2">
      {list && list.length > 0
        ? list.map((item, index) => (
            <div key={'tags_' + item}>
              {item ? (
                <Chips.Removable variant="neutral" onClick={() => onRemove(index)}>
                  {item}
                </Chips.Removable>
              ) : null}
            </div>
          ))
        : null}
    </Chips>
  )
}
