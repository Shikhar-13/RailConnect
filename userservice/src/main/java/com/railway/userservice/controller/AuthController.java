package com.railway.userservice.controller;

import com.railway.userservice.dto.UserDto;
import com.railway.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AUTH CONTROLLER — public endpoints, no JWT needed.
 *
 * POST /api/auth/register  → sign up
 * POST /api/auth/login     → sign in, get tokens
 * POST /api/auth/refresh   → get new access token using refresh token
 * POST /api/auth/logout    → invalidate tokens
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * REGISTER
     *
     * POST /api/auth/register
     * Body: { firstName, lastName, email, password, mobile, dateOfBirth, gender, nationality }
     */
    @PostMapping("/register")
    public ResponseEntity<UserDto.ApiResponse<UserDto.AuthResponse>> register(
            @Valid @RequestBody UserDto.RegisterRequest request) {

        UserDto.AuthResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserDto.ApiResponse.success("Registration successful!", response));
    }

    /**
     * LOGIN
     *
     * POST /api/auth/login
     * Body: { email, password }
     */
    @PostMapping("/login")
    public ResponseEntity<UserDto.ApiResponse<UserDto.AuthResponse>> login(
            @Valid @RequestBody UserDto.LoginRequest request) {

        UserDto.AuthResponse response = userService.login(request);
        return ResponseEntity.ok(UserDto.ApiResponse.success("Login successful.", response));
    }

    /**
     * REFRESH TOKEN
     *
     * POST /api/auth/refresh
     * Body: { refreshToken }
     *
     * Call this when the access token expires (you get a 401).
     * Returns a fresh access + refresh token pair.
     */
    @PostMapping("/refresh")
    public ResponseEntity<UserDto.ApiResponse<UserDto.AuthResponse>> refresh(
            @Valid @RequestBody UserDto.RefreshTokenRequest request) {

        UserDto.AuthResponse response = userService.refreshToken(request);
        return ResponseEntity.ok(UserDto.ApiResponse.success("Token refreshed.", response));
    }

    /**
     * LOGOUT
     *
     * POST /api/auth/logout
     * Header: Authorization: Bearer <token>
     */
    @PostMapping("/logout")
    public ResponseEntity<UserDto.ApiResponse<Void>> logout(
            @RequestHeader("Authorization") String authHeader) {

        userService.logout(authHeader);
        return ResponseEntity.ok(UserDto.ApiResponse.success("Logged out successfully.", null));
    }
}