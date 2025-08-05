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
