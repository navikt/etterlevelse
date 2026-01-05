import { EPvkVurdering } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import * as yup from 'yup'

export const pvkBehovSchema = () => {
  return yup.object({
    pvkVurderingsBegrunnelse: yup.string().test({
      name: 'pvkVurderingsBegrunnelse',
      message: 'Dere må begrunne hvorfor dere ikke skal gjennomføre PVK',
      test: function (value) {
        const vurdering = (this as any)?.parent?.pvkVurdering
        // Require non-empty validation for both "SKAL_IKKE_UTFORE" and "ALLEREDE_UTFORT"
        if (
          vurdering === EPvkVurdering.SKAL_IKKE_UTFORE ||
          vurdering === EPvkVurdering.ALLEREDE_UTFORT
        ) {
          return typeof value === 'string' && value.trim().length > 0
        }
        // Otherwise allow without validation
        return true
      },
    }),
  })
}
export default pvkBehovSchema
