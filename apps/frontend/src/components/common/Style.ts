export const marginZero = {
  marginLeft: '0rem',
  marginRight: '0rem',
  marginTop: '0rem',
  marginBottom: '0rem',
}
export const marginAll = (marg: string) => ({
  marginLeft: marg,
  marginRight: marg,
  marginTop: marg,
  marginBottom: marg,
})
export const margin = (topBot: string, leftRight: string) => ({
  marginLeft: leftRight,
  marginRight: leftRight,
  marginTop: topBot,
  marginBottom: topBot,
})
export const paddingZero = {
  paddingLeft: '0rem',
  paddingRight: '0rem',
  paddingTop: '0rem',
  paddingBottom: '0rem',
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
export const hideBorder = borderColor('transparent')
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

export const cardShadow = {
  Root: {
    style: {
      ...hideBorder,
      boxShadow: '0rem 0rem 0.375rem 0.188rem rgba(0,0,0,0.08);',
    },
  },
}
