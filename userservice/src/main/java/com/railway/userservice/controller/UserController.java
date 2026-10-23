package com.railway.userservice.controller;

import com.railway.userservice.dto.UserDto;
import com.railway.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * USER CONTROLLER — protected endpoints (need valid JWT).
 *
 * PROFILE (any logged-in user):
 *   GET  /api/users/me                         → get my profile
 *   PUT  /api/users/me                         → update profile
 *   PUT  /api/users/me/change-password         → change password
 *
 * PASSENGER LIST (any logged-in user):
 *   GET    /api/users/me/passengers            → get my saved passenger list
 *   POST   /api/users/me/passengers            → add a passenger (max 6)
 *   PUT    /api/users/me/passengers/{id}       → update a saved passenger
 *   DELETE /api/users/me/passengers/{id}       → remove a saved passenger
 *
 * ADMIN only:
 *   GET  /api/admin/users                      → list all users
 *   GET  /api/admin/users/{id}                 → get one user
 *   PUT  /api/admin/users/{id}/toggle-status   → enable / disable account
 */
@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @GetMapping("/api/users/me")
    public ResponseEntity<UserDto.ApiResponse<UserDto.UserResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        UserDto.UserResponse user = userService.getMyProfile(userDetails.getUsername());
        return ResponseEntity.ok(UserDto.ApiResponse.success("Profile fetched.", user));
    }

    @PutMapping("/api/users/me")
    public ResponseEntity<UserDto.ApiResponse<UserDto.UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserDto.UpdateProfileRequest request) {

        UserDto.UserResponse user = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(UserDto.ApiResponse.success("Profile updated.", user));
    }

    @PutMapping("/api/users/me/change-password")
    public ResponseEntity<UserDto.ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserDto.ChangePasswordRequest request) {

        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(UserDto.ApiResponse.success(
                "Password changed. Please log in again.", null));
    }

    // ================================================================
    // PASSENGER LIST
    // ================================================================

    /**
     * GET MY PASSENGER LIST
     *
     * GET /api/users/me/passengers
     * Returns all saved passengers (up to 6) for the logged-in user.
     */
    @GetMapping("/api/users/me/passengers")
    public ResponseEntity<UserDto.ApiResponse<List<UserDto.PassengerResponse>>> getMyPassengers(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<UserDto.PassengerResponse> passengers = userService.getMyPassengers(userDetails.getUsername());
        return ResponseEntity.ok(UserDto.ApiResponse.success(
                "Passengers fetched. Count: " + passengers.size(), passengers));
    }

    /**
     * ADD A PASSENGER
     *
     * POST /api/users/me/passengers
     * Body: { firstName, lastName, dateOfBirth, gender, nationality, idProofType, idProofNumber, berthPreference }
     */
    @PostMapping("/api/users/me/passengers")
    public ResponseEntity<UserDto.ApiResponse<UserDto.PassengerResponse>> addPassenger(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserDto.PassengerRequest request) {

        UserDto.PassengerResponse passenger = userService.addPassenger(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserDto.ApiResponse.success("Passenger added.", passenger));
    }

    /**
     * UPDATE A SAVED PASSENGER
     *
     * PUT /api/users/me/passengers/3
     */
    @PutMapping("/api/users/me/passengers/{passengerId}")
    public ResponseEntity<UserDto.ApiResponse<UserDto.PassengerResponse>> updatePassenger(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable("passengerId") Long passengerId,
            @Valid @RequestBody UserDto.PassengerRequest request) {

        UserDto.PassengerResponse passenger = userService.updatePassenger(
                userDetails.getUsername(), passengerId, request);
        return ResponseEntity.ok(UserDto.ApiResponse.success("Passenger updated.", passenger));
    }

    /**
     * DELETE A SAVED PASSENGER
     *
     * DELETE /api/users/me/passengers/3
     */
    @DeleteMapping("/api/users/me/passengers/{passengerId}")
    public ResponseEntity<UserDto.ApiResponse<Void>> deletePassenger(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable("passengerId") Long passengerId) {

        userService.deletePassenger(userDetails.getUsername(), passengerId);
        return ResponseEntity.ok(UserDto.ApiResponse.success("Passenger removed.", null));
    }

    // ================================================================
    // ADMIN ENDPOINTS
    // ================================================================

    @GetMapping("/api/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto.ApiResponse<List<UserDto.UserResponse>>> getAllUsers() {
        List<UserDto.UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(UserDto.ApiResponse.success(
                "Total users: " + users.size(), users));
    }

    @GetMapping("/api/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto.ApiResponse<UserDto.UserResponse>> getUserById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(UserDto.ApiResponse.success("User fetched.", userService.getUserById(id)));
    }

    /**
     * TOGGLE USER STATUS — enables or disables an account.
     * If disabled, all their active tokens are revoked immediately.
     *
     * PUT /api/admin/users/5/toggle-status
     */
    @PutMapping("/api/admin/users/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto.ApiResponse<UserDto.UserResponse>> toggleUserStatus(@PathVariable("id") Long id) {
        UserDto.UserResponse user = userService.toggleUserStatus(id);
        String msg = user.isActive() ? "Account enabled." : "Account disabled.";
        return ResponseEntity.ok(UserDto.ApiResponse.success(msg, user));
    }
}