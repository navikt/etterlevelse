import {
  FileObject,
  FileRejected,
  FileRejectionReason,
  FileUpload,
  Heading,
  VStack,
} from '@navikt/ds-react'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

const MAX_FILES = 4
const MAX_SIZE_MB = 5
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024

const errors: Record<FileRejectionReason, string> = {
  fileType: 'Filformatet støttes ikke',
  fileSize: `Filen er større enn ${MAX_SIZE_MB} MB`,
}

interface IProps {
  initialValues: File[]
  rejectedFiles: FileRejected[]
  setRejectedFiles: Dispatch<SetStateAction<FileRejected[]>>
  setFilesToUpload: Dispatch<SetStateAction<File[]>>
}

export const CustomFileUpload = (props: IProps) => {
  const { initialValues, rejectedFiles, setRejectedFiles, setFilesToUpload } = props
  const [files, setFiles] = useState<FileObject[]>([])
  const acceptedFiles = files.filter((file) => !file.error)

  useEffect(() => {
    if (initialValues && initialValues.length > 0) {
      const initialFiles: FileObject[] = []
      initialValues.forEach((initialFile) => {
        initialFiles.push({ file: initialFile, error: false })
      })
      setFiles(initialFiles)
      setFilesToUpload(initialValues)
    }
  }, [initialValues])

  useEffect(() => {
    setRejectedFiles(files.filter((f): f is FileRejected => f.error))
  }, [files])

  const removeFile = (fileToRemove: FileObject) => {
    setFiles(files.filter((file) => file !== fileToRemove))
    setFilesToUpload(files.filter((file) => file !== fileToRemove).map((file) => file.file))
  }

  const getErrorMessage = (message: string): string => {
    if (message === 'fileType' || message === 'fileSize') {
      return errors[message as FileRejectionReason]
    } else {
      return message
    }
  }

  return (
    <VStack gap="6">
      <FileUpload.Dropzone
        label="Last opp behandlingens livsløp"
        description={`Følgende filformater er tillatt: PDF, PNG, JPG og JPEG. Du kan laste opp maks 4 filer. Filstørrelse pr. fil må være mindre enn ${MAX_SIZE_MB} MB.`}
        accept=".png,.jpeg,.pdf,.jpg"
        maxSizeInBytes={MAX_SIZE}
        fileLimit={{ max: MAX_FILES, current: acceptedFiles.length }}
        validator={(file: File) => {
          if (files.map((file) => file.file.name).includes(file.name)) {
            return 'Filen er allerede lastet opp'
          }
          return true
        }}
        onSelect={(newFiles: FileObject[]) => {
          setFiles([...files, ...newFiles])
          setFilesToUpload([
            ...files.map((file) => file.file),
            ...newFiles.map((newFile) => newFile.file),
          ])
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
                  },
                }}
              />
            ))}
          </VStack>
        </VStack>
      )}
      {rejectedFiles.length > 0 && (
        <VStack gap="2">
          <Heading level="3" size="xsmall" id="vedleggMedFeil">
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
                error={getErrorMessage(rejected.reasons[0])}
              />
            ))}
          </VStack>
        </VStack>
      )}
    </VStack>
  )
}

export default CustomFileUpload
