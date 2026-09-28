package no.nav.data.common.auditing;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.utils.MdcUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DeleteCommentFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (!"DELETE".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String deleteComment = StringUtils.trimToNull(request.getParameter("comment"));
        if (deleteComment == null) {
            throw new ValidationException("Delete comment is required");
        }

        MdcUtils.setDeleteComment(deleteComment);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MdcUtils.clearDeleteComment();
        }
    }
}


