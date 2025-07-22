export const loginUrl = (locationUrl: string, path?: string) => {
  const pathLength = path ? path.length : 0
  const frontpage = locationUrl.substring(0, locationUrl.length - pathLength)

  return `/login?redirect_uri=${frontpage}${path || ''}`
}
