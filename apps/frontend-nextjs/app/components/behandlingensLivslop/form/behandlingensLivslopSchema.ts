import * as yup from 'yup'

export const behandlingensLivslopSchema = () =>
  yup.object({
    rejectedFiles: yup.array().test({
      name: 'rejectedFiles test',
      message: 'Cannot submit with rejected files',
      test: (rejectedFiles) => {
        return rejectedFiles && rejectedFiles.length > 0 ? false : true
      },
    }),
  })

export default behandlingensLivslopSchema
