// EXPECTED AND SHOULD CRASH APPLICATION IF VALUES ARE NOT DEFINED

export const env = {
  backendBaseUrl: process.env.NEXT_APP_BACKEND_ENDPOINT || '/api',
  amplitudeEndpoint: process.env.NEXT_APP_AMPLITUDE_ENDPOINT!,
  amplitudeApiKey: process.env.NEXT_APP_AMPLITUDE_API_KEY!,
  teamKatBaseUrl: process.env.NEXT_APP_TEAMKAT_BASE_URL!,
  pollyBaseUrl: process.env.NEXT_APP_POLLY_BASE_URL!,
  githubVersion: process.env.NEXT_APP_GIT_VERSION || 'local',
  lovdataLovBaseUrl: process.env.NEXT_APP_LOVDATA_LOV_BASE_URL!,
  lovdataForskriftBaseUrl: process.env.NEXT_APP_LOVDATA_FORSKRIFT_BASE_URL!,
  lovdataRundskrivBaseUrl: process.env.NEXT_APP_LOVDATA_RUNDSKRIV_BASE_URL!,
  p360BaseUrl: process.env.NEXT_APP_P360_BASE_URL!,
}
