package no.nav.data.common.utils;

import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;

import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;

@UtilityClass
public class ImageUtils {

    @SneakyThrows
    public static byte[] resize(byte[] content, Integer width) {
        var image = ImageIO.read(new ByteArrayInputStream(content));
        int height = (int) ((double) width / image.getWidth() * image.getHeight());

        var si = image.getScaledInstance(width, height, Image.SCALE_SMOOTH);
        var newImg = new BufferedImage(width, height, image.getType());
        var g = newImg.createGraphics();
        g.drawImage(si, 0, 0, null);
        g.dispose();

        var output = new ByteArrayOutputStream();
        ImageIO.write(newImg, "png", output);
        return output.toByteArray();
    }
}
