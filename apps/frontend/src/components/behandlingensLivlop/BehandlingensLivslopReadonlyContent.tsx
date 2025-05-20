import { BodyLong, FileObject, FileUpload, Heading, Label, VStack } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'
import { IBehandlingensLivslopRequest, IEtterlevelseDokumentasjon } from '../../constants'
import DataTextWrapper from '../PvoTilbakemelding/common/DataTextWrapper'
import { Markdown } from '../common/Markdown'
import BehandlingensLivsLopSidePanel from './BehandlingensLivslopSidePanel'
import BehandlingensLivslopTextContent from './BehandlingensLivslopTextContent'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  behandlingensLivslop: IBehandlingensLivslopRequest
  noSidePanelContent?: boolean
}

export const BehandlingensLivslopReadOnlyContent: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  behandlingensLivslop,
  noSidePanelContent,
}) => {
  const [files, setFiles] = useState<FileObject[]>([])

  useEffect(() => {
    if (behandlingensLivslop.filer && behandlingensLivslop.filer.length > 0) {
      const initialFiles: FileObject[] = []
      behandlingensLivslop.filer.forEach((initialFile) => {
        initialFiles.push({ file: initialFile, error: false })
      })
      setFiles(initialFiles)
    }
  }, [behandlingensLivslop])

  return (
    <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
      <div className='flex justify-center'>
        <div>
          <Heading level='1' size='medium' className='mb-5'>
            Behandlingens livsløp
          </Heading>

          <BehandlingensLivslopTextContent />

          <VStack gap='6' className='mt-5'>
            <VStack gap='2'>
              <Heading level='3' size='xsmall'>
                {`Behandlingens livsløp filer som er lastet opp. (${files.length})`}
              </Heading>
              <VStack as='ul' gap='3'>
                {files.length > 0 &&
                  files.map((file, index) => (
                    <FileUpload.Item as='li' key={file.file.name + '_' + index} file={file.file} />
                  ))}
                {files.length === 0 && <DataTextWrapper>Ingen filer</DataTextWrapper>}
              </VStack>
            </VStack>
          </VStack>

          <div className='mt-5'>
            <Label>Beskrivelse av behandlingens livsløp</Label>
            <DataTextWrapper>
              {behandlingensLivslop.beskrivelse && (
                <Markdown source={behandlingensLivslop.beskrivelse} />
              )}
              <BodyLong>{!behandlingensLivslop.beskrivelse && 'Ingen beskrivelse '}</BodyLong>
            </DataTextWrapper>
          </div>

          {!noSidePanelContent && (
            <div className='mt-5'>
              <div className='pt-6 border-t border-[#071a3636]'>
                <BehandlingensLivsLopSidePanel
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BehandlingensLivslopReadOnlyContent
