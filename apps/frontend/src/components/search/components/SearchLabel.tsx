import { Block } from 'baseui/block'
import * as React from 'react'
import { ettlevColors } from '../../../util/theme'

const SearchLabel = (props: { name: string; type: string; backgroundColor?: string; foregroundColor?: string }) => {
  return (
    <Block display="flex" justifyContent="space-between" width="100%" $style={{
      borderTopWidth: '1px',
      borderTopStyle: 'solid',
      borderTopColor: ettlevColors.grey50,
      paddingTop: '12px',
      paddingBottom: '12px'
    }}>
      <span style={{ padding: '5px' }}>{props.name} </span>
      {/* <Block $style={{ backgroundColor: props.backgroundColor, padding: '5px', margin: '5px', borderRadius: '5px', maxHeight: '20px' }}>{props.type}</Block> */}
    </Block>
  )
}

export default SearchLabel
