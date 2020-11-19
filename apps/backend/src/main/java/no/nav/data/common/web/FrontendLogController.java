package no.nav.data.common.web;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.JsonUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@Tag(description = "Frontend logging", name = "Logging")
@RequestMapping("/frontendlog")
public class FrontendLogController {

    @Operation(summary = "Write log")
    @ApiResponses(value = {@ApiResponse(description = "Log written")})
    @PostMapping
    public void write(@RequestBody LogRequest request) {
        var string = JsonUtils.toJson(request);
        switch (request.level) {
            case info -> log.info(string);
            case warn -> log.warn(string);
            case error -> log.error(string);
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LogRequest {

        public enum Level {info, warn, error}

        private Level level;
        private String context;
        private String content;

    }

}
