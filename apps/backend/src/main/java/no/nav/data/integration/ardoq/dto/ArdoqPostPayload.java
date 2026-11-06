package no.nav.data.integration.ardoq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArdoqPostPayload<T> {
    private ArdoqConfig config;
    private List<ArdoqTable<T>> tables;



    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    private static class ArdoqConfig {
        private String id;
        private String name;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    private static class ArdoqTable<T> {
        private String id;
        private List<T> rows;
    }
}
