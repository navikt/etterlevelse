package no.nav.data.common.utils;

import net.lingala.zip4j.io.outputstream.ZipOutputStream;
import net.lingala.zip4j.model.ZipParameters;
import no.nav.data.etterlevelse.arkivering.domain.ArchiveFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;


public class ZipUtils {

    public byte[] zipOutputStream(List<ArchiveFile> filesToAdd) throws IOException {

        ZipParameters zipParameters = new ZipParameters();
        ByteArrayOutputStream bos = new ByteArrayOutputStream();

        byte[] bufferReader = new byte[4096];
        int readLength;

        try(ZipOutputStream zos = new ZipOutputStream(bos)) {
            for (ArchiveFile fileToAdd : filesToAdd) {

                zipParameters.setFileNameInZip(fileToAdd.getFileName());
                zos.putNextEntry(zipParameters);

                try(InputStream inputStream = new ByteArrayInputStream(fileToAdd.getFile())) {
                    while ((readLength = inputStream.read(bufferReader)) != -1) {
                        zos.write(bufferReader, 0, readLength);
                    }
                }
                zos.closeEntry();
            }
            zos.close();
            return bos.toByteArray();
        }
    }
}
