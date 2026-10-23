package com.railway.userservice.security;

import com.railway.userservice.repository.TokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor // Lombok: creates constructor with all final fields
@Slf4j                   // Lombok: adds a logger (log.info, log.error, etc.)
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenRepository tokenRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain  // Chain of all filters - we call this to pass to next filter
    ) throws ServletException, IOException {


        final String requestPath = request.getServletPath();
        if (requestPath.contains("/api/auth/")) {
            filterChain.doFilter(request, response); // Pass to next filter/controller
            return;
        }


        final String authHeader = request.getHeader("Authorization");


        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        final String userEmail;
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            filterChain.doFilter(request, response);
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            var tokenInDb = tokenRepository.findByToken(jwt);
            boolean isTokenValidInDb = tokenInDb
                    .map(token -> !token.isExpired() && !token.isRevoked())
                    .orElse(false);

            if (jwtService.isTokenValid(jwt, userDetails) && isTokenValidInDb) {
                log.info("User {} authenticated successfully in userservice with authorities: {}", userEmail, userDetails.getAuthorities());
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                log.warn("Token validation failed in userservice for user: {}. isTokenValid: {}, isTokenValidInDb: {}", 
                        userEmail, jwtService.isTokenValid(jwt, userDetails), isTokenValidInDb);
            }
        }


        filterChain.doFilter(request, response);

    }
}