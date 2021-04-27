export const marginZero = {marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}
export const marginAll = (marg: string) => ({marginLeft: marg, marginRight: marg, marginTop: marg, marginBottom: marg})
export const paddingZero = {paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0}
export const padding = (topBot: string, leftRight: string) => ({paddingLeft: leftRight, paddingRight: leftRight, paddingTop: topBot, paddingBottom: topBot})
export const paddingAll = (pad: string) => ({paddingLeft: pad, paddingRight: pad, paddingTop: pad, paddingBottom: pad})
export const borderColor = (color?: string) => ({
  borderLeftColor: color, borderTopColor: color,
  borderRightColor: color, borderBottomColor: color
})
export const hideBorder = borderColor('transparent')
export const borderRadius = (r: string) => ({borderBottomLeftRadius: r, borderBottomRightRadius: r, borderTopLeftRadius: r, borderTopRightRadius: r})
export const borderStyle = (r: any) => ({borderBottomStyle: r, borderTopStyle: r, borderRightStyle: r, borderLeftStyle: r})
export const borderWidth = (r: string) => ({borderBottomWidth: r, borderTopWidth: r, borderRightWidth: r, borderLeftWidth: r})

export const cardShadow = {
  Root: {
    style: {
      ...hideBorder,
      boxShadow: '0px 0px 6px 3px rgba(0,0,0,0.08);'
    }
  }
}
