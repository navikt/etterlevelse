import {
  FileObject,
  FileRejected,
  FileRejectionReason,
  FileUpload,
  Heading,
  VStack,
} from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { useEffect, useState } from 'react'

const MAX_FILES = 4
const MAX_SIZE_MB = 5
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024

const errors: Record<FileRejectionReason, string> = {
  fileType: 'Filformatet støttes ikke',
  fileSize: `Filen er større enn ${MAX_SIZE_MB} MB`,
}

interface IProps {
  initialValues: File[]
}

export const CustomFileUpload = (props: IProps) => {
  const { initialValues } = props
  const [files, setFiles] = useState<FileObject[]>([])
  const acceptedFiles = files.filter((file) => !file.error)
  const rejectedFiles = files.filter((f): f is FileRejected => f.error)

  useEffect(() => {
    if (initialValues && initialValues.length > 0) {
      const initialFiles: FileObject[] = []
      initialValues.forEach((initialFile) => {
        initialFiles.push({ file: initialFile, error: false })
      })
      setFiles(initialFiles)
    }
  }, [])

  const removeFile = (fileToRemove: FileObject) => {
    setFiles(files.filter((file) => file !== fileToRemove))
  }

  return (
    <FieldArray name="filer">
      {(fieldArrayRenderProps: FieldArrayRenderProps) => (
        <VStack gap="6">
          <FileUpload.Dropzone
            label="Last opp behandlingslivsløp"
            description={`Støttet filformater er pdf, png, og jpeg. Maks 4 filer. Maks størrelse på ${MAX_SIZE_MB} MB.`}
            accept=".png,.jpeg,.pdf"
            maxSizeInBytes={MAX_SIZE}
            fileLimit={{ max: MAX_FILES, current: acceptedFiles.length }}
            onSelect={(newFiles: FileObject[]) => {
              setFiles([...files, ...newFiles])
              newFiles.forEach((file) => {
                if (!file.error) {
                  const reader = new FileReader()
                  reader.readAsArrayBuffer(file.file)
                  reader.onloadend = () => {
                    fieldArrayRenderProps.push(file.file)
                  }
                }
              })
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
                    key={file.file.name + '_' + index}
                    file={file.file}
                    button={{
                      action: 'delete',
                      onClick: () => {
                        removeFile(file)
                        fieldArrayRenderProps.remove(index)
                      },
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
                      onClick: () => {
                        removeFile(rejected)
                      },
                    }}
                    error={errors[rejected.reasons[0] as FileRejectionReason]}
                  />
                ))}
              </VStack>
            </VStack>
          )}
        </VStack>
      )}
    </FieldArray>
  )
}

export default CustomFileUpload
