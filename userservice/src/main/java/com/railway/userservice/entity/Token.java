package com.railway.userservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * TOKEN ENTITY - Stores JWT refresh tokens in the database.
 *
 * WHY DO WE STORE TOKENS?
 * When a user logs out, we need to invalidate their token.
 * JWT tokens can't be "deleted" from the client side, so we keep track of
 * which tokens are valid/invalid in this table.
 *
 * This also lets us:
 * - Log out from all devices (invalidate all tokens for a user)
 * - Detect stolen tokens
 * - Implement refresh token rotation (security best practice)
 */
@Entity
@Table(name = "tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 1000)
    private String token; // The actual JWT token string

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenType tokenType; // What kind of token (ACCESS or REFRESH)

    @Column(nullable = false)
    private boolean expired; // Has this token been manually expired?

    @Column(nullable = false)
    private boolean revoked; // Has this token been revoked (e.g., on logout)?

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime expiresAt;

    // Many tokens can belong to ONE user
    // @ManyToOne means "many tokens -> one user"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // This creates a foreign key column
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * TOKEN TYPE ENUM
     * ACCESS  = Short-lived token for API access (24 hours)
     * REFRESH = Long-lived token to get a new access token (7 days)
     */
    public enum TokenType {
        ACCESS,
        REFRESH
    }
}