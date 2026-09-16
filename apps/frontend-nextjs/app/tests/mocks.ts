export const mockIdent = 'Z123456'

export const mockEtterlevelseDokumentasjoner = {
  data: {
    etterlevelseDokumentasjoner: {
      pageNumber: 0,
      pageSize: 20,
      pages: 1,
      numberOfElements: 1,
      totalElements: 1,
      content: [
        {
          id: 'umami-etterlevelse',
          title: 'krav',
          etterlevelseNummer: 123,
          etterlevelseDokumentVersjon: 1,
          hasCurrentUserAccess: true,
          sistEndretEtterlevelse: null,
          sistEndretEtterlevelseAvMeg: null,
          sistEndretDokumentasjonAvMeg: null,
          changeStamp: { createdDate: '2026-01-01T00:00:00.000Z' },
          teamsData: [],
        },
      ],
    },
  },
}

export const mockUser = {
  loggedIn: true,
  ident: mockIdent,
  name: 'Bat, Man',
  email: 'bat.man@nav.no',
  groups: ['ADMIN', 'WRITE', 'READ'],
}
