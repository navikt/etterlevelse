package no.nav.data.common.security.azure.support;

import com.github.benmanes.caffeine.cache.Expiry;
import com.microsoft.aad.msal4j.IAuthenticationResult;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.time.Instant;

@Slf4j
public class AuthResultExpiry implements Expiry<String, IAuthenticationResult> {

    private static final Duration DEFAULT_EXPIRE = Duration.ofMinutes(1);
    private static final Duration MIN_REFRESH_MARGIN = Duration.ofMinutes(10);
    private static final Duration DOUBLE_MIN_REFRESH_MARGIN = MIN_REFRESH_MARGIN.multipliedBy(2);

    @Override
    public long expireAfterCreate(String key, IAuthenticationResult value, long currentTime) {
        return expire(value).toNanos();
    }

    @Override
    public long expireAfterUpdate(String key, IAuthenticationResult value, long currentTime, long currentDuration) {
        return currentDuration;
    }

    @Override
    public long expireAfterRead(String key, IAuthenticationResult value, long currentTime, long currentDuration) {
        return currentDuration;
    }

    private Duration expire(IAuthenticationResult value) {
        if (value.expiresOnDate().getTime() == 0L) {
            log.debug("Acquired token, TTL missing default cache expire {}s", DEFAULT_EXPIRE.toSeconds());
            return DEFAULT_EXPIRE;
        }
        Duration duration = Duration.between(Instant.now(), value.expiresOnDate().toInstant());
        Duration expire = suggestedRefreshInterval(duration);
        log.debug("Acquired token, TTL {}s cache expire {}s", duration.toSeconds(), expire.toSeconds());
        return expire;
    }

    private static Duration suggestedRefreshInterval(Duration duration) {
        if (duration.minus(DOUBLE_MIN_REFRESH_MARGIN).isNegative()) {
            return duration.dividedBy(2);
        } else {
            return duration.minus(MIN_REFRESH_MARGIN);
        }
    }
}
