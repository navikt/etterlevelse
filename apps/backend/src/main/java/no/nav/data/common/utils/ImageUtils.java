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

        var bi = new BufferedImage(image.getWidth(), image.getHeight(), image.getType());
        int height = (int) ((double) width / image.getWidth() * image.getHeight());
        var newImg = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        var si = bi.getScaledInstance(width, height, Image.SCALE_SMOOTH);
        var g = newImg.createGraphics();
        g.drawImage(si, 0, 0, null);
        g.dispose();

        var output = new ByteArrayOutputStream();
        ImageIO.write(newImg, "png", output);
        return output.toByteArray();
    }
}
