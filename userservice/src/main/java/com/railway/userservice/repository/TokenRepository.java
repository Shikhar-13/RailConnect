package com.railway.userservice.repository;

import com.railway.userservice.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * TOKEN REPOSITORY - Database layer for JWT tokens.
 */
@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    // Find a token by its string value
    Optional<Token> findByToken(String token);

    // Find all valid (not expired and not revoked) tokens for a user
    @Query("""
        SELECT t FROM Token t
        WHERE t.user.id = :userId
        AND t.expired = false
        AND t.revoked = false
    """)
    List<Token> findAllValidTokensByUser(@Param("userId") Long userId);

    // Revoke (invalidate) all tokens for a user - used when logging out from all devices
    @Modifying
    @Transactional
    @Query("""
        UPDATE Token t
        SET t.expired = true, t.revoked = true
        WHERE t.user.id = :userId
    """)
    void revokeAllUserTokens(@Param("userId") Long userId);
}