package no.nav.data.etterlevelse.util;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
//@Profile("!prod")
@Slf4j
@Component
public class LogExecutionTimeAdvice {

    @Around("execution(public * no.nav..*Repo.*(..)) || execution(public * no.nav..*Repository.*(..)) || execution(public * no.nav..*RepoImpl.*(..))")
    public Object logExecTimeAdviceForRepo(ProceedingJoinPoint point) throws Throwable {
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
            log.info("Execution time for query {}: {} ms", point.getSignature().toString(), execTime);
        }
        if (thrown != null) {
            throw thrown;
        } else {
            return result;
        }
    }

    @Around("execution(public * no.nav..*Controller.*(..)))")
    public Object logExecTimeAdviceForController(ProceedingJoinPoint point) throws Throwable {
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
            log.info("Execution time for request {}: {} ms", point.getSignature().toString(), execTime);
        }
        if (thrown != null) {
            throw thrown;
        } else {
            return result;
        }
    }

}
