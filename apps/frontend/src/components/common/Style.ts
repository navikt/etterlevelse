export const marginZero = {
  marginLeft: '0rem',
  marginRight: '0rem',
  marginTop: '0rem',
  marginBottom: '0rem',
}
export const padding = (topBot: string, leftRight: string) => ({
  paddingLeft: leftRight,
  paddingRight: leftRight,
  paddingTop: topBot,
  paddingBottom: topBot,
})
export const paddingAll = (pad: string) => ({
  paddingLeft: pad,
  paddingRight: pad,
  paddingTop: pad,
  paddingBottom: pad,
})
export const borderColor = (color?: string) => ({
  borderLeftColor: color,
  borderTopColor: color,
  borderRightColor: color,
  borderBottomColor: color,
})

export const borderRadius = (r: string) => ({
  borderBottomLeftRadius: r,
  borderBottomRightRadius: r,
  borderTopLeftRadius: r,
  borderTopRightRadius: r,
})
export const borderStyle = (r: any) => ({
  borderBottomStyle: r,
  borderTopStyle: r,
  borderRightStyle: r,
  borderLeftStyle: r,
})
export const borderWidth = (r: string) => ({
  borderBottomWidth: r,
  borderTopWidth: r,
  borderRightWidth: r,
  borderLeftWidth: r,
})
