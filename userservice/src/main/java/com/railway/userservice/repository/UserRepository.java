package com.railway.userservice.repository;

import com.railway.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * USER REPOSITORY — all DB operations for the users table.
 *
 * Spring Data JPA auto-generates SQL from method names.
 * We only write @Query for things that need custom SQL.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByMobile(String mobile);

    boolean existsByEmail(String email);

    boolean existsByMobile(String mobile);

    // Admin: list all active users
    List<User> findByIsActiveTrue();

    // Admin: search by name (first OR last)
    @Query("SELECT u FROM User u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> searchByName(@Param("name") String name);

    // Soft-delete / disable account
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.isActive = :status WHERE u.id = :id")
    void updateActiveStatus(@Param("id") Long id, @Param("status") boolean status);
}