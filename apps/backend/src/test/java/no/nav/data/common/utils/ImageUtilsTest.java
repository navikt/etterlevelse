package no.nav.data.common.utils;

import lombok.SneakyThrows;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import static org.assertj.core.api.Assertions.assertThat;

class ImageUtilsTest {

    @Test
    @SneakyThrows
    void resize() {
        byte[] image = new ClassPathResource("img.png").getInputStream().readAllBytes();

        var resized = ImageUtils.resize(image, 640);

        assertThat(resized).isNotNull();
    }
}