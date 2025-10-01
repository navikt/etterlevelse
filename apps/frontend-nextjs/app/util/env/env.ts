// EXPECTED AND SHOULD CRASH PUBLICLICATION IF VALUES ARE NOT DEFINED

export const env = {
  backendBaseUrl: process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || '/api',
  amplitudeEndpoint: process.env.NEXT_PUBLIC_AMPLITUDE_ENDPOINT!,
  amplitudeApiKey: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!,
  teamKatBaseUrl: process.env.NEXT_PUBLIC_TEAMKAT_BASE_URL!,
  pollyBaseUrl: process.env.NEXT_PUBLIC_POLLY_BASE_URL!,
  githubVersion: process.env.NEXT_PUBLIC_GIT_VERSION || 'local',
  lovdataLovBaseUrl: process.env.NEXT_PUBLIC_LOVDATA_LOV_BASE_URL!,
  lovdataForskriftBaseUrl: process.env.NEXT_PUBLIC_LOVDATA_FORSKRIFT_BASE_URL!,
  lovdataRundskrivBaseUrl: process.env.NEXT_PUBLIC_LOVDATA_RUNDSKRIV_BASE_URL!,
  p360BaseUrl: process.env.NEXT_PUBLIC_P360_BASE_URL!,
}
