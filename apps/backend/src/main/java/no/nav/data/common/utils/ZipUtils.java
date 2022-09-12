package no.nav.data.common.utils;

import lombok.extern.slf4j.Slf4j;
import net.lingala.zip4j.io.outputstream.ZipOutputStream;
import net.lingala.zip4j.model.ZipParameters;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Slf4j
public class ZipUtils {

    public void zipOutputStream(File outputZipFile, List<File> filesToAdd) {

        ZipParameters zipParameters = new ZipParameters();

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
        } catch (IOException e) {
            log.error("zip output stream error, error: "+ e.getMessage());
        }
    }

    private ZipOutputStream initializeZipOutputStream(File outputZipFile) throws IOException {

        FileOutputStream fos = new FileOutputStream(outputZipFile);
        return new ZipOutputStream(fos);
    }
}
