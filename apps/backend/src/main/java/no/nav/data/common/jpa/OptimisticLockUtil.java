package no.nav.data.common.jpa;

import no.nav.data.common.exceptions.ValidationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.util.Objects;

public final class OptimisticLockUtil {

    private OptimisticLockUtil() {
    }

    /**
     * For oppdatering fra API/frontend: klienten MÅ sende versjonen den sist leste.
     */
    public static void checkVersion(Class<?> type, Object id, Integer currentVersion, Integer requestVersion) {
        if (requestVersion == null) {
            throw new ValidationException("version is required when updating %s with id %s".formatted(type.getSimpleName(), id));
        }
        if (!Objects.equals(currentVersion, requestVersion)) {
            throw new ObjectOptimisticLockingFailureException(type, id);
        }
    }

    /**
     * For sletting fra API/frontend: versjon er valgfri. Sjekkes kun hvis den er oppgitt.
     */
    public static void checkVersionIfPresent(Class<?> type, Object id, Integer currentVersion, Integer requestVersion) {
        if (requestVersion != null && !Objects.equals(currentVersion, requestVersion)) {
            throw new ObjectOptimisticLockingFailureException(type, id);
        }
    }

    /**
     * For @Modifying-spørringer: verifiserer at forventet antall rader ble endret.
     */
    public static void checkRowCount(Class<?> type, Object id, int expected, int actual) {
        if (expected != actual) {
            throw new ObjectOptimisticLockingFailureException(
                    "Expected %d row(s) of %s (id %s) to be modified, but %d was modified".formatted(expected, type.getSimpleName(), id, actual), null);
        }
    }
}
