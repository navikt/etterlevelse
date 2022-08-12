package no.nav.data.common.web;

import no.nav.data.common.utils.MdcUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
