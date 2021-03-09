package no.nav.data.common.rest;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class PageParametersTest {

    @Test
    void pageFrom() {
        var pageInput = new PageParameters(1, 10);

        var input = Arrays.asList(IntStream.range(0, 45).boxed().toArray(Integer[]::new));

        var page = pageInput.pageFrom(input);

        assertThat(page.isPaged()).isTrue();
        assertThat(page.getPageNumber()).isOne();
        assertThat(page.getPageSize()).isEqualTo(10);
        assertThat(page.getPages()).isEqualTo(5);
        assertThat(page.getNumberOfElements()).isEqualTo(10);
        assertThat(page.getTotalElements()).isEqualTo(45);
        assertThat(page.getContent()).isEqualTo(input.subList(10, 20));
    }
}