import { EPvkVurdering } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import * as yup from 'yup'

export const pvkBehovSchema = () => {
  return yup.object({
    pvkVurderingsBegrunnelse: yup.string().test({
      name: 'pvkVurderingsBegrunnelse',
      message: 'Dere må begrunne hvorfor dere ikke skal gjennomføre PVK',
      test: function (pvkVurderingsBegrunnelse) {
        const { parent } = this
        if (
          parent.pvkVurdering !== undefined &&
          parent.pvkVurdering !== null &&
          parent.pvkVurdering !== EPvkVurdering.UNDEFINED &&
          parent.pvkVurdering !== EPvkVurdering.SKAL_IKKE_UTFORE &&
          parent.pvkVurdering !== EPvkVurdering.ALLEREDE_UTFORT
        ) {
          return pvkVurderingsBegrunnelse === '' || pvkVurderingsBegrunnelse === undefined
        } else {
          return false
        }
      },
    }),
  })
}
export default pvkBehovSchema
