export const logApi = (
  level: 'info' | 'warn' | 'error',
  context: string,
  content: string
): void => {
  console.debug(`Logging to backend: ${level} - ${context} - ${content}`)

  //  axios
  //  .post(`${env.backendBaseUrl}/frontendlog`, { level, context, content })
  //  .catch((error) => console.error('error writing log', error))
}
