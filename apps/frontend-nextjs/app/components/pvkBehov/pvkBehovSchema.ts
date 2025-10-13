import * as yup from 'yup'

export const pvkBehovSchema = () => {
  return yup.object({
    pvkVurderingsBegrunnelse: yup.string().test({
      name: 'pvkVurderingsBegrunnelse',
      message: 'Dere må begrunne hvorfor dere ikke skal gjennomføre PVK',
      test: function (pvkVurderingsBegrunnelse) {
        const { parent } = this
        if (
          parent.skalUtforePvk !== undefined &&
          parent.skalUtforePvk !== null &&
          !parent.skalUtforePvk
        ) {
          return !(pvkVurderingsBegrunnelse === '' || pvkVurderingsBegrunnelse === undefined)
        } else {
          return true
        }
      },
    }),
  })
}
export default pvkBehovSchema
