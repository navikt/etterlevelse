import {
  FileObject,
  FileRejected,
  FileRejectionReason,
  FileUpload,
  Heading,
  VStack,
} from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import { useState } from 'react'

const MAX_FILES = 4
const MAX_SIZE_MB = 5
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024

const errors: Record<FileRejectionReason, string> = {
  fileType: 'Filformatet støttes ikke',
  fileSize: `Filen er større enn ${MAX_SIZE_MB} MB`,
}

export const CustomFileUpload = () => {
  const [files, setFiles] = useState<FileObject[]>([])
  const acceptedFiles = files.filter((file) => !file.error)
  const rejectedFiles = files.filter((f): f is FileRejected => f.error)

  const removeFile = (
    fileToRemove: FileObject,
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean
    ) => Promise<void | FormikErrors<any>>
  ) => {
    const fileUpdated = files.filter((file) => file !== fileToRemove)
    setFieldValue('WIP', fileUpdated)
    setFiles(fileUpdated)
  }

  return (
    <Field>
      {(fieldProps: FieldProps) => (
        <VStack gap="6">
          <FileUpload.Dropzone
            label="Last opp behandlingslivsløp"
            description={`Støttet filformater er pdf, png, og jpeg. Maks 4 filer. Maks størrelse på ${MAX_SIZE_MB} MB.`}
            accept=".png,.jpeg,.pdf"
            maxSizeInBytes={MAX_SIZE}
            fileLimit={{ max: MAX_FILES, current: acceptedFiles.length }}
            onSelect={(newFiles: FileObject[]) => {
              setFiles([...files, ...newFiles])
              fieldProps.form.setFieldValue('WIP', [...files, ...newFiles])
            }}
          />

          {acceptedFiles.length > 0 && (
            <VStack gap="2">
              <Heading level="3" size="xsmall">
                {`Vedlegg (${acceptedFiles.length})`}
              </Heading>
              <VStack as="ul" gap="3">
                {acceptedFiles.map((file, index) => (
                  <FileUpload.Item
                    as="li"
                    key={index}
                    file={file.file}
                    button={{
                      action: 'delete',
                      onClick: () => removeFile(file, fieldProps.form.setFieldValue),
                    }}
                  />
                ))}
              </VStack>
            </VStack>
          )}
          {rejectedFiles.length > 0 && (
            <VStack gap="2">
              <Heading level="3" size="xsmall">
                Vedlegg med feil
              </Heading>
              <VStack as="ul" gap="3">
                {rejectedFiles.map((rejected, index) => (
                  <FileUpload.Item
                    as="li"
                    key={index}
                    file={rejected.file}
                    button={{
                      action: 'delete',
                      onClick: () => removeFile(rejected, fieldProps.form.setFieldValue),
                    }}
                    error={errors[rejected.reasons[0] as FileRejectionReason]}
                  />
                ))}
              </VStack>
            </VStack>
          )}
        </VStack>
      )}
    </Field>
  )
}

export default CustomFileUpload
