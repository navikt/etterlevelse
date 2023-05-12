package no.nav.data.common.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import no.nav.data.common.utils.MdcUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class UserFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        MdcUtils.setUserFromSecurity();
        try {
            filterChain.doFilter(request, response);
        } finally {
            MdcUtils.clearUser();
        }
    }
}
