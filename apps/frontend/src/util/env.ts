export const env = {
  backendBaseUrl: process.env.REACT_APP_BACKEND_ENDPOINT,
  amplitudeEndpoint: process.env.REACT_APP_AMPLITUDE_ENDPOINT,
  amplitudeApiKey: process.env.REACT_APP_AMPLITUDE_API_KEY,
  githubVersion: process.env.REACT_APP_GIT_VERSION || 'local'
};
