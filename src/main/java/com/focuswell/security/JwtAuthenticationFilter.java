package com.focuswell.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        logger.debug("Processing request: {}", requestURI);

        // Skip JWT processing for login, register, and OPTIONS requests
        if (requestURI.equals("/api/users/login") || requestURI.equals("/api/users/register") || request.getMethod().equals("OPTIONS")) {
            logger.debug("Skipping JWT filter for: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        String authorizationHeader = request.getHeader("Authorization");
        logger.debug("Authorization Header: {}", authorizationHeader);

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            logger.warn("No valid Bearer token found for request: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authorizationHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            logger.debug("Extracted username from JWT: {}", username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                logger.debug("User loaded: {}", userDetails.getUsername());

                if (jwtUtil.isTokenValid(token, userDetails)) {
                    logger.debug("Token valid for user: {}", username);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    logger.warn("Invalid or expired JWT token for user: {}", username);
                }
            } else {
                logger.warn("No username extracted or authentication already set for request: {}", requestURI);
            }
        } catch (Exception e) {
            logger.error("Error processing JWT for request: {}. Error: {}", requestURI, e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid JWT token: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }
}
