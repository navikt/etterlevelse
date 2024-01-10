/* eslint-disable @typescript-eslint/no-non-null-assertion */
// EXPECTED AND SHOULD CRASH APPLICATION IF VALUES ARE NOT DEFINED

export const env = {
  backendBaseUrl: process.env.REACT_APP_BACKEND_ENDPOINT!,
  amplitudeEndpoint: process.env.REACT_APP_AMPLITUDE_ENDPOINT!,
  amplitudeApiKey: process.env.REACT_APP_AMPLITUDE_API_KEY!,
  teamKatBaseUrl: process.env.REACT_APP_TEAMKAT_BASE_URL!,
  pollyBaseUrl: process.env.REACT_APP_POLLY_BASE_URL!,
  githubVersion: process.env.REACT_APP_GIT_VERSION || 'local',
  lovdataLovBaseUrl: process.env.REACT_APP_LOVDATA_LOV_BASE_URL!,
  lovdataForskriftBaseUrl: process.env.REACT_APP_LOVDATA_FORSKRIFT_BASE_URL!,
}
