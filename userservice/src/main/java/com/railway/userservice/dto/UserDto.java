package com.railway.userservice.dto;

import com.railway.userservice.entity.Passenger;
import com.railway.userservice.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ALL DTOs for the User Service — kept in one file for simplicity.
 *
 * DTO = Data Transfer Object
 * → Controls exactly what data comes IN (requests) and goes OUT (responses).
 * → Ensures the password field NEVER leaks out in a response.
 * → Validates incoming data before it even reaches the service layer.
 */
public class UserDto {

    // ================================================================
    // AUTH REQUEST DTOs
    // ================================================================

    /**
     * REGISTER REQUEST — what the client sends when signing up.
     * Mirrors IRCTC's registration form fields.
     */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {

        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 50, message = "First name must be 2–50 characters")
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 50, message = "Last name must be 2–50 characters")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$",
            message = "Password must have at least one digit, uppercase, lowercase and special character"
        )
        private String password;

        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
        private String mobile;

        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be in the past")
        private LocalDate dateOfBirth;

        @NotNull(message = "Gender is required")
        private User.Gender gender;

        @NotBlank(message = "Nationality is required")
        private String nationality;
    }

    /**
     * LOGIN REQUEST
     */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    /**
     * UPDATE PROFILE REQUEST — only non-sensitive fields.
     * Email/password changes are separate for security.
     */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateProfileRequest {

        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 50)
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 50)
        private String lastName;

        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
        private String mobile;

        @NotBlank(message = "Nationality is required")
        private String nationality;

        // ID proof can be added/updated from profile page
        private User.IdProofType idProofType;

        @Size(max = 50)
        private String idProofNumber;
    }

    /**
     * CHANGE PASSWORD REQUEST
     */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChangePasswordRequest {

        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$",
            message = "Password must have at least one digit, uppercase, lowercase and special character"
        )
        private String newPassword;

        @NotBlank(message = "Please confirm your new password")
        private String confirmPassword;
    }

    /**
     * REFRESH TOKEN REQUEST
     */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RefreshTokenRequest {

        @NotBlank(message = "Refresh token is required")
        private String refreshToken;
    }

    // ================================================================
    // PASSENGER REQUEST DTOs
    // ================================================================

    /**
     * ADD / UPDATE PASSENGER REQUEST — for the saved passenger list.
     * Same fields IRCTC asks when adding a passenger to the master list.
     */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PassengerRequest {

        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 50)
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 50)
        private String lastName;

        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be in the past")
        private LocalDate dateOfBirth;

        @NotNull(message = "Gender is required")
        private User.Gender gender;

        @NotBlank(message = "Nationality is required")
        private String nationality;

        private User.IdProofType idProofType;

        @Size(max = 50)
        private String idProofNumber;

        private Passenger.BerthPreference berthPreference;
    }

    // ================================================================
    // RESPONSE DTOs
    // ================================================================

    /**
     * AUTH RESPONSE — returned after successful login or register.
     */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;       // Always "Bearer"
        private Long expiresIn;         // Seconds until access token expires
        private UserResponse user;
    }

    /**
     * USER RESPONSE — safe to send to client (NO password, ID proof masked).
     */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String mobile;
        private LocalDate dateOfBirth;
        private User.Gender gender;
        private String nationality;
        private User.IdProofType idProofType;
        private String idProofNumber;   // Masked: "XXXX-XXXX-1234"
        private User.Role role;
        private boolean isActive;
        private LocalDateTime createdAt;
    }

    /**
     * PASSENGER RESPONSE — safe to send back (ID number masked).
     */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PassengerResponse {
        private Long id;
        private String firstName;
        private String lastName;
        private LocalDate dateOfBirth;
        private User.Gender gender;
        private String nationality;
        private User.IdProofType idProofType;
        private String idProofNumber;   // Masked
        private Passenger.BerthPreference berthPreference;
    }

    /**
     * GENERIC API RESPONSE WRAPPER — every endpoint returns this shape.
     *
     * Example success: { "success": true,  "message": "...", "data": {...} }
     * Example error:   { "success": false, "message": "...", "data": null  }
     */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder().success(true).message(message).data(data).build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder().success(false).message(message).build();
        }
    }
}