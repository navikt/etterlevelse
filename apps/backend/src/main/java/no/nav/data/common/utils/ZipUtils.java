package no.nav.data.common.utils;

import net.lingala.zip4j.io.outputstream.ZipOutputStream;
import net.lingala.zip4j.model.ZipParameters;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;


public class ZipUtils {

    //depricated and will replace in the future
    public byte[] zipOutputStream(List<ZipFile> filesToAdd) throws IOException {

        ZipParameters zipParameters = new ZipParameters();
        ByteArrayOutputStream bos = new ByteArrayOutputStream();

        byte[] bufferReader = new byte[4096];
        int readLength;

        try(ZipOutputStream zos = new ZipOutputStream(bos)) {
            for (ZipFile fileToAdd : filesToAdd) {

                zipParameters.setFileNameInZip(fileToAdd.getFilnavn() + "." + fileToAdd.getFiltype());
                zos.putNextEntry(zipParameters);

                try(InputStream inputStream = new ByteArrayInputStream(fileToAdd.getFil())) {
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
