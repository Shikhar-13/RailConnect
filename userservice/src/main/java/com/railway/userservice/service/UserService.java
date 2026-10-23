package com.railway.userservice.service;

import com.railway.userservice.dto.UserDto;
import com.railway.userservice.entity.Passenger;
import com.railway.userservice.entity.Token;
import com.railway.userservice.entity.User;
import com.railway.userservice.repository.PassengerRepository;
import com.railway.userservice.repository.TokenRepository;
import com.railway.userservice.repository.UserRepository;
import com.railway.userservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * USER SERVICE — all business logic for users and their saved passengers.
 *
 * IRCTC features implemented here:
 *  1. Register / Login / Logout / Refresh token
 *  2. View & update profile (with ID proof)
 *  3. Change password
 *  4. Saved passenger list (add / view / update / delete)
 *  5. Admin: list users, toggle account, change role
 *
 * What we REMOVED vs v1 to stay lean:
 *  - searchUsers (admin can use getAllUsers for now)
 *  - updateLastLoginTime tracking
 *  - STAFF role management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private static final int MAX_PASSENGERS_PER_USER = 6; // Same limit as IRCTC

    private final UserRepository       userRepository;
    private final PassengerRepository  passengerRepository;
    private final TokenRepository      tokenRepository;
    private final PasswordEncoder      passwordEncoder;
    private final JwtService           jwtService;
    private final AuthenticationManager authenticationManager;

    // ================================================================
    // AUTH
    // ================================================================

    /**
     * REGISTER — create a new passenger account.
     */
    @Transactional
    public UserDto.AuthResponse register(UserDto.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("An account already exists with this email.");

        if (userRepository.existsByMobile(req.getMobile()))
            throw new RuntimeException("An account already exists with this mobile number.");

        User user = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .mobile(req.getMobile())
                .dateOfBirth(req.getDateOfBirth())
                .gender(req.getGender())
                .nationality(req.getNationality())
                .role(User.Role.PASSENGER)
                .isActive(true)
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: id={}, email={}", saved.getId(), saved.getEmail());

        String access  = jwtService.generateAccessToken(saved);
        String refresh = jwtService.generateRefreshToken(saved);
        saveTokens(saved, access, refresh);

        return buildAuthResponse(access, refresh, saved);
    }

    /**
     * LOGIN — verify credentials, issue fresh tokens.
     */
    @Transactional
    public UserDto.AuthResponse login(UserDto.LoginRequest req) {
        // Spring Security verifies email + password; throws BadCredentialsException if wrong
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!user.isActive())
            throw new RuntimeException("Your account has been disabled. Please contact support.");

        // Revoke old tokens, issue new ones
        tokenRepository.revokeAllUserTokens(user.getId());
        String access  = jwtService.generateAccessToken(user);
        String refresh = jwtService.generateRefreshToken(user);
        saveTokens(user, access, refresh);

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(access, refresh, user);
    }

    /**
     * REFRESH TOKEN — swap a valid refresh token for a new access + refresh pair.
     */
    @Transactional
    public UserDto.AuthResponse refreshToken(UserDto.RefreshTokenRequest req) {
        String refreshToken = req.getRefreshToken();
        String email = jwtService.extractUsername(refreshToken);

        if (email == null)
            throw new RuntimeException("Invalid refresh token.");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        boolean validInDb = tokenRepository.findByToken(refreshToken)
                .map(t -> !t.isExpired() && !t.isRevoked())
                .orElse(false);

        if (!validInDb || !jwtService.isTokenValid(refreshToken, user))
            throw new RuntimeException("Refresh token is expired or revoked. Please log in again.");

        tokenRepository.revokeAllUserTokens(user.getId());
        String newAccess  = jwtService.generateAccessToken(user);
        String newRefresh = jwtService.generateRefreshToken(user);
        saveTokens(user, newAccess, newRefresh);

        return buildAuthResponse(newAccess, newRefresh, user);
    }

    /**
     * LOGOUT — revoke all tokens so the session is dead server-side.
     */
    @Transactional
    public void logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return;

        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        if (email == null) return;

        userRepository.findByEmail(email).ifPresent(user -> {
            tokenRepository.revokeAllUserTokens(user.getId());
            log.info("User logged out: {}", email);
        });
    }

    // ================================================================
    // USER PROFILE
    // ================================================================

    /**
     * GET MY PROFILE — the logged-in user's own details.
     */
    public UserDto.UserResponse getMyProfile(String email) {
        User user = findByEmailOrThrow(email);
        return toUserResponse(user);
    }

    /**
     * UPDATE PROFILE — name, mobile, nationality, ID proof.
     */
    @Transactional
    public UserDto.UserResponse updateProfile(String email, UserDto.UpdateProfileRequest req) {
        User user = findByEmailOrThrow(email);

        // If mobile is changing, check it's not taken by another account
        if (!user.getMobile().equals(req.getMobile()) && userRepository.existsByMobile(req.getMobile()))
            throw new RuntimeException("This mobile number is already registered with another account.");

        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setMobile(req.getMobile());
        user.setNationality(req.getNationality());

        // Update ID proof only if provided
        if (req.getIdProofType() != null)   user.setIdProofType(req.getIdProofType());
        if (req.getIdProofNumber() != null) user.setIdProofNumber(req.getIdProofNumber());

        return toUserResponse(userRepository.save(user));
    }

    /**
     * CHANGE PASSWORD — requires old password verification.
     * After success, all tokens are revoked (forces re-login — security best practice).
     */
    @Transactional
    public void changePassword(String email, UserDto.ChangePasswordRequest req) {
        User user = findByEmailOrThrow(email);

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword()))
            throw new RuntimeException("Current password is incorrect.");

        if (!req.getNewPassword().equals(req.getConfirmPassword()))
            throw new RuntimeException("New password and confirm password do not match.");

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        tokenRepository.revokeAllUserTokens(user.getId());

        log.info("Password changed for user: {}", email);
    }

    // ================================================================
    // PASSENGER LIST  (IRCTC master passenger list)
    // ================================================================

    /**
     * GET ALL SAVED PASSENGERS for the logged-in user.
     */
    public List<UserDto.PassengerResponse> getMyPassengers(String email) {
        User user = findByEmailOrThrow(email);
        return passengerRepository.findByUserId(user.getId())
                .stream().map(this::toPassengerResponse).collect(Collectors.toList());
    }

    /**
     * ADD A PASSENGER to the user's saved list.
     * IRCTC allows a maximum of 6 saved passengers per account.
     */
    @Transactional
    public UserDto.PassengerResponse addPassenger(String email, UserDto.PassengerRequest req) {
        User user = findByEmailOrThrow(email);

        long count = passengerRepository.countByUserId(user.getId());
        if (count >= MAX_PASSENGERS_PER_USER)
            throw new RuntimeException("You can save a maximum of " + MAX_PASSENGERS_PER_USER + " passengers.");

        Passenger passenger = Passenger.builder()
                .user(user)
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .dateOfBirth(req.getDateOfBirth())
                .gender(req.getGender())
                .nationality(req.getNationality())
                .idProofType(req.getIdProofType())
                .idProofNumber(req.getIdProofNumber())
                .berthPreference(req.getBerthPreference() != null
                        ? req.getBerthPreference()
                        : Passenger.BerthPreference.NO_PREFERENCE)
                .build();

        return toPassengerResponse(passengerRepository.save(passenger));
    }

    /**
     * UPDATE A SAVED PASSENGER's details.
     */
    @Transactional
    public UserDto.PassengerResponse updatePassenger(String email, Long passengerId, UserDto.PassengerRequest req) {
        User user = findByEmailOrThrow(email);
        Passenger passenger = passengerRepository.findByIdAndUserId(passengerId, user.getId())
                .orElseThrow(() -> new RuntimeException("Passenger not found or does not belong to your account."));

        passenger.setFirstName(req.getFirstName());
        passenger.setLastName(req.getLastName());
        passenger.setDateOfBirth(req.getDateOfBirth());
        passenger.setGender(req.getGender());
        passenger.setNationality(req.getNationality());
        if (req.getIdProofType() != null)    passenger.setIdProofType(req.getIdProofType());
        if (req.getIdProofNumber() != null)  passenger.setIdProofNumber(req.getIdProofNumber());
        if (req.getBerthPreference() != null) passenger.setBerthPreference(req.getBerthPreference());

        return toPassengerResponse(passengerRepository.save(passenger));
    }

    /**
     * DELETE A SAVED PASSENGER from the list.
     */
    @Transactional
    public void deletePassenger(String email, Long passengerId) {
        User user = findByEmailOrThrow(email);
        Passenger passenger = passengerRepository.findByIdAndUserId(passengerId, user.getId())
                .orElseThrow(() -> new RuntimeException("Passenger not found or does not belong to your account."));
        passengerRepository.delete(passenger);
        log.info("Passenger {} deleted for user {}", passengerId, email);
    }

    // ================================================================
    // ADMIN
    // ================================================================

    public List<UserDto.UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toUserResponse).collect(Collectors.toList());
    }

    public UserDto.UserResponse getUserById(Long id) {
        return toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id)));
    }

    @Transactional
    public UserDto.UserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setActive(!user.isActive());
        if (!user.isActive()) tokenRepository.revokeAllUserTokens(id); // kick them out immediately
        return toUserResponse(userRepository.save(user));
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    private User findByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private void saveTokens(User user, String access, String refresh) {
        Token accessToken = Token.builder()
                .user(user).token(access)
                .tokenType(Token.TokenType.ACCESS)
                .expired(false).revoked(false)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        Token refreshToken = Token.builder()
                .user(user).token(refresh)
                .tokenType(Token.TokenType.REFRESH)
                .expired(false).revoked(false)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        tokenRepository.save(accessToken);
        tokenRepository.save(refreshToken);
    }

    private UserDto.AuthResponse buildAuthResponse(String access, String refresh, User user) {
        return UserDto.AuthResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime() / 1000)
                .user(toUserResponse(user))
                .build();
    }

    /**
     * Convert User entity → UserResponse DTO.
     * Masks the ID proof number so it's safe to send to the client:
     *   "123456789012" → "XXXXXXXX9012"
     */
    private UserDto.UserResponse toUserResponse(User u) {
        return UserDto.UserResponse.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .mobile(u.getMobile())
                .dateOfBirth(u.getDateOfBirth())
                .gender(u.getGender())
                .nationality(u.getNationality())
                .idProofType(u.getIdProofType())
                .idProofNumber(maskIdNumber(u.getIdProofNumber()))
                .role(u.getRole())
                .isActive(u.isActive())
                .createdAt(u.getCreatedAt())
                .build();
    }

    /**
     * Convert Passenger entity → PassengerResponse DTO (ID number masked).
     */
    private UserDto.PassengerResponse toPassengerResponse(Passenger p) {
        return UserDto.PassengerResponse.builder()
                .id(p.getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .dateOfBirth(p.getDateOfBirth())
                .gender(p.getGender())
                .nationality(p.getNationality())
                .idProofType(p.getIdProofType())
                .idProofNumber(maskIdNumber(p.getIdProofNumber()))
                .berthPreference(p.getBerthPreference())
                .build();
    }

    /**
     * Mask all but last 4 characters of an ID number.
     * "123456789012" → "XXXXXXXX9012"
     */
    private String maskIdNumber(String idNumber) {
        if (idNumber == null || idNumber.length() <= 4) return idNumber;
        String visible = idNumber.substring(idNumber.length() - 4);
        return "X".repeat(idNumber.length() - 4) + visible;
    }
}