package no.nav.data.common.rest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.Getter;
import no.nav.data.common.utils.StreamUtils;
import org.springframework.data.domain.Page;

import java.util.Collection;
import java.util.List;
import java.util.function.Function;

@Getter
@JsonPropertyOrder({"pageNumber", "pageSize", "pages", "numberOfElements", "totalElements", "paged", "content"})
public class RestResponsePage<T> {

    // Fields are deserialized via field injection (see @JsonProperty below) rather than a @JsonCreator
    // constructor. Jackson 3 dropped Jackson 2's ALLOW_FINAL_FIELDS_AS_MUTATORS default, so final fields
    // could no longer be populated during deserialization. A constructor-based @JsonCreator only fixes the
    // base type, but the many empty `... extends RestResponsePage<>` subclasses cannot inherit a creator and
    // would fall back to the no-arg constructor with empty content. Non-final + @JsonProperty fields are
    // inherited by every subclass, so they all deserialize correctly.
    @JsonProperty("pageNumber")
    private long pageNumber;
    @JsonProperty("pageSize")
    private long pageSize;
    @JsonProperty("pages")
    private long pages;
    @JsonProperty("numberOfElements")
    private long numberOfElements;
    @JsonProperty("totalElements")
    private long totalElements;
    @Parameter(description = "False if operation always returns all elements")
    @JsonProperty("paged")
    private boolean paged;
    @JsonProperty("content")
    private List<T> content;

    public RestResponsePage(
            long pageNumber,
            long pageSize,
            long pages,
            long numberOfElements,
            long totalElements,
            boolean paged,
            List<T> content
    ) {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.pages = pages;
        this.numberOfElements = numberOfElements;
        this.totalElements = totalElements;
        this.paged = paged;
        this.content = content;
    }

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