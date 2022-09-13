package no.nav.data.common.utils;

import lombok.extern.slf4j.Slf4j;
import net.lingala.zip4j.io.outputstream.ZipOutputStream;
import net.lingala.zip4j.model.ZipParameters;
import no.nav.data.etterlevelse.arkivering.domain.ArchiveFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Slf4j
public class ZipUtils {

    public byte[] zipOutputStream(List<ArchiveFile> filesToAdd) throws IOException {

        ZipParameters zipParameters = new ZipParameters();
        ByteArrayOutputStream bos = new ByteArrayOutputStream();

        byte[] buff = new byte[4096];
        int readLen;

        try(ZipOutputStream zos = new ZipOutputStream(bos)) {
            for (ArchiveFile fileToAdd : filesToAdd) {

                zipParameters.setFileNameInZip(fileToAdd.getFileName());
                zos.putNextEntry(zipParameters);

                try(InputStream inputStream = new ByteArrayInputStream(fileToAdd.getFile())) {
                    while ((readLen = inputStream.read(buff)) != -1) {
                        zos.write(buff, 0, readLen);
                    }
                }
                zos.closeEntry();
            }
            zos.close();
            return bos.toByteArray();
        }
    }
}
