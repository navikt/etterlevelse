package no.nav.data.etterlevelse.util;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Aspect
@Profile("!prod")
@Slf4j
@Component
public class LogExecutionTimeAdvice {

    @Around("execution(public * no.nav..*Repo.*(..)) || execution(public * no.nav..*Repository.*(..)) || execution(public * no.nav..*RepoImpl.*(..))")
    public Object logExecTimeAdvice(ProceedingJoinPoint point) throws Throwable {
        Throwable thrown = null;
        Object result = null;
        long execTime = System.currentTimeMillis();
        try {
            result = point.proceed();
        } catch (Throwable t) {
            thrown = t;
        }
        execTime = System.currentTimeMillis() - execTime;
        var methodSignature = point.getSignature().toString();
        if(execTime > 500 && methodSignature.contains("no.nav")) {
            log.warn("Execution time for {}: {} ms", point.getSignature().toString(), execTime);
        }
        if (thrown != null) {
            throw thrown;
        } else {
            return result;
        }
    }

}
