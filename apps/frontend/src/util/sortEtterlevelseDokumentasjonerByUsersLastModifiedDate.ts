import moment from 'moment'
import { TEtterlevelseDokumentasjonQL } from '../constants'

export const sortEtterlevelseDokumentasjonerByUsersLastModifiedDate = (
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
) => {
  return etterlevelseDokumentasjoner.sort((a, b) => {
    if (!a.sistEndretEtterlevelseAvMeg && b.sistEndretEtterlevelseAvMeg) {
      if (a.sistEndretDokumentasjonAvMeg) {
        return (
          moment(b.sistEndretEtterlevelseAvMeg).valueOf() -
          moment(a.sistEndretDokumentasjonAvMeg).valueOf()
        )
      } else {
        return 1
      }
    }
    if (!b.sistEndretEtterlevelseAvMeg && a.sistEndretEtterlevelseAvMeg) {
      if (b.sistEndretDokumentasjonAvMeg) {
        return (
          moment(b.sistEndretDokumentasjonAvMeg).valueOf() -
          moment(a.sistEndretEtterlevelseAvMeg).valueOf()
        )
      } else {
        return -1
      }
    }
    if (!a.sistEndretEtterlevelseAvMeg && !b.sistEndretEtterlevelseAvMeg) {
      if (a.sistEndretDokumentasjonAvMeg && b.sistEndretDokumentasjonAvMeg) {
        return (
          moment(b.sistEndretDokumentasjonAvMeg).valueOf() -
          moment(a.sistEndretDokumentasjonAvMeg).valueOf()
        )
      } else {
        return (
          moment(b.changeStamp.createdDate).valueOf() - moment(a.changeStamp.createdDate).valueOf()
        )
      }
    } else {
      return (
        moment(b.sistEndretEtterlevelseAvMeg).valueOf() -
        moment(a.sistEndretEtterlevelseAvMeg).valueOf()
      )
    }
  })
}
