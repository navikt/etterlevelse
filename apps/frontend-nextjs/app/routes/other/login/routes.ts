export const loginUrl = (path?: string) => {
  const location = [path]
  const frontpage = window.location.href.substr(0, window.location.href.length - location.length)

  return `/login?redirect_uri=${frontpage}${path || ''}`
}
