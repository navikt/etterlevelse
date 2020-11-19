package no.nav.data.common.web;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.nais.NaisEndpoints;
import no.nav.data.common.validator.RequestElement;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Collection;
import java.util.stream.Stream;

@Slf4j
@Aspect
@Component
public class RequestPointcut {

    @Before("execution(* no.nav.data..*Controller.*(..))")
    public void beforeController(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        if (signature.getMethod().getDeclaringClass().equals(NaisEndpoints.class)) {
            return;
        }
        log.debug("{} {}", signature.getDeclaringType().getSimpleName(), signature.getName());

        boolean isPut = signature.getMethod().isAnnotationPresent(PutMapping.class);
        Stream.of(joinPoint.getArgs())
                .flatMap(arg -> {
                    if (arg instanceof RequestElement re) {
                        return Stream.of(re);
                    }
                    if (arg instanceof Collection<?> c) {
                        return c.stream().filter(a -> a instanceof RequestElement).map(a -> ((RequestElement) a));
                    }
                    return Stream.empty();
                })
                .forEach(req -> {
                    log.trace("setting update");
                    req.setUpdate(isPut);
                });
    }

}
