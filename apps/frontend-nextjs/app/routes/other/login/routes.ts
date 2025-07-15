export const loginUrl = (path?: string) => {
  const frontpage = window.location.href.substr(
    0,
    window.location.href.length - window.location.pathname.length
  )

  return `/login?redirect_uri=${frontpage}${path || ''}`
}
