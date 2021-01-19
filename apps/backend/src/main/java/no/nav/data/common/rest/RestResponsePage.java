package no.nav.data.common.rest;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.AllArgsConstructor;
import lombok.Getter;
import no.nav.data.common.utils.StreamUtils;
import org.springframework.data.domain.Page;

import java.util.Collection;
import java.util.List;
import java.util.function.Function;

@Getter
@AllArgsConstructor
@JsonPropertyOrder({"pageNumber", "pageSize", "pages", "numberOfElements", "totalElements", "paged", "content"})
public class RestResponsePage<T> {

    private final long pageNumber;
    private final long pageSize;
    private final long pages;
    private final long numberOfElements;
    private final long totalElements;
    @Parameter(description = "False if operation always returns all elements")
    private final boolean paged;
    private final List<T> content;

    public RestResponsePage(Page<T> page) {
        this.content = page.getContent();
        this.pageNumber = page.getNumber();
        this.pageSize = page.getSize();
        this.pages = page.getTotalPages();
        this.numberOfElements = page.getNumberOfElements();
        this.totalElements = page.getTotalElements();
        this.paged = true;
    }

    public RestResponsePage() {
        this(List.of());
    }

    public RestResponsePage(List<T> content) {
        this(content, content.size());
    }

    public RestResponsePage(List<T> content, long totalResults) {
        this.content = content;
        this.pageNumber = 0L;
        this.pages = 1L;
        this.pageSize = content.size();
        this.numberOfElements = content.size();
        this.totalElements = totalResults;
        this.paged = false;
    }

    public <R> RestResponsePage<R> convert(Function<T, R> converter) {
        return new RestResponsePage<>(pageNumber, pageSize, pages, numberOfElements, totalElements, paged, StreamUtils.convert(content, converter));
    }

    public <R> RestResponsePage<R> convertBatch(Function<Collection<T>, List<R>> converter) {
        return new RestResponsePage<>(pageNumber, pageSize, pages, numberOfElements, totalElements, paged, converter.apply(content));
    }
}