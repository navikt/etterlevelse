package no.nav.data.common.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Mapper optimistisk låsefeil (inkl. ObjectOptimisticLockingFailureException fra Hibernate) til HTTP 409 Conflict.
 */
@Slf4j
@RestControllerAdvice
public class OptimisticLockingExceptionHandler {

    public static final String OPTIMISTIC_LOCKING_FAILURE = "OPTIMISTIC_LOCKING_FAILURE";

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<Map<String, Object>> handleOptimisticLockingFailure(OptimisticLockingFailureException e) {
        log.warn("Optimistic locking failure: {}", e.getMessage());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", HttpStatus.CONFLICT.getReasonPhrase());
        // Kan brukes av frontend for å skille versjonskonflikt fra andre 409 (f.eks. CodelistNotErasableException)
        body.put("type", OPTIMISTIC_LOCKING_FAILURE);
        body.put("message", "Konflikt: Dataene er endret av en annen. Last inn på nytt og prøv igjen.");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }
}
