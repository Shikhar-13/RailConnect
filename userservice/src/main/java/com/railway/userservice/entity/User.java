package com.railway.userservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * USER ENTITY — maps to the "users" table in MySQL.
 *
 * Modelled after IRCTC's user profile:
 *  - Basic info (name, email, mobile, DOB, gender)
 *  - ID proof (Aadhaar / PAN / Passport)
 *  - Nationality
 *  - Role (PASSENGER / ADMIN)
 *
 * What we REMOVED vs v1 to keep it lighter:
 *  - No address field (IRCTC takes address only at booking time)
 *  - No STAFF role (can add later)
 *  - No lastLoginAt (not needed for core flow)
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "mobile")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Basic info ──────────────────────────────────────────
    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;           // BCrypt hashed — never plain text

    @Column(nullable = false, unique = true, length = 10)
    private String mobile;             // 10-digit mobile number

    // ── IRCTC-specific fields ────────────────────────────────
    @Column(nullable = false)
    private LocalDate dateOfBirth;     // Required for train ticket booking

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;             // MALE / FEMALE / OTHER

    @Column(nullable = false, length = 30)
    private String nationality;        // e.g. "Indian" — default for most users

    // ── ID Proof (like IRCTC's ID proof section) ─────────────
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private IdProofType idProofType;   // AADHAAR / PAN / PASSPORT / VOTER_ID / DRIVING_LICENSE

    @Column(length = 50)
    private String idProofNumber;      // The actual ID number (masked in responses)

    // ── Account meta ─────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Role role;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ── UserDetails methods (Spring Security) ────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;  // We log in with email
    }

    @Override public boolean isAccountNonExpired()    { return true; }
    @Override public boolean isAccountNonLocked()     { return isActive; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()              { return isActive; }

    // ── Enums ─────────────────────────────────────────────────

    public enum Gender {
        MALE, FEMALE, OTHER
    }

    public enum IdProofType {
        AADHAAR,
        PAN,
        PASSPORT,
        VOTER_ID,
        DRIVING_LICENSE
    }

    public enum Role {
        PASSENGER,
        ADMIN
    }
}