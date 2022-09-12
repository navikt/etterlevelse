package no.nav.data.common.utils;

import lombok.extern.slf4j.Slf4j;
import net.lingala.zip4j.io.outputstream.ZipOutputStream;
import net.lingala.zip4j.model.ZipParameters;

import java.io.*;
import java.util.List;

@Slf4j
public class ZipUtils {

    public byte[] zipOutputStream(File outputZipFile, List<File> filesToAdd) {

        ZipParameters zipParameters = new ZipParameters();
        ByteArrayOutputStream bos = new ByteArrayOutputStream();

        byte[] buff = new byte[4096];
        int readLen;

        try(ZipOutputStream zos = initializeZipOutputStream(outputZipFile)) {
            for (File fileToAdd : filesToAdd) {

                zipParameters.setFileNameInZip(fileToAdd.getName());
                zos.putNextEntry(zipParameters);

                try(InputStream inputStream = new FileInputStream(fileToAdd)) {
                    while ((readLen = inputStream.read(buff)) != -1) {
                        zos.write(buff, 0, readLen);
                    }
                }
                zos.closeEntry();
            }
            zos.close();
            bos.writeTo(zos);
            return bos.toByteArray();
        } catch (IOException e) {
            log.error("zip output stream error, error: "+ e.getMessage());
            return null;
        }
    }

    private ZipOutputStream initializeZipOutputStream(File outputZipFile) throws IOException {
        FileOutputStream fos = new FileOutputStream(outputZipFile);
        return new ZipOutputStream(fos);
    }
}
