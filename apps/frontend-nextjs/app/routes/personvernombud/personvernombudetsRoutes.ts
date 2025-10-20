export const pvoUrl: string = '/pvo'
export const pvoOversiktUrl: string = `${pvoUrl}/oversikt`
export const pvotilbakemeldingUrl: string = `${pvoUrl}tilbakemelding`

export const pvoTabQueryUrl = (tabQuery: string): string => `${pvoOversiktUrl}?tab=${tabQuery}`
