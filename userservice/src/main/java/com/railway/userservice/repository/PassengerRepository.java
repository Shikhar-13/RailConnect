package com.railway.userservice.repository;

import com.railway.userservice.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * PASSENGER REPOSITORY — DB operations for the passengers table.
 */
@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {

    // Get all saved passengers for a user (their master passenger list)
    List<Passenger> findByUserId(Long userId);

    // Count how many passengers a user has saved (IRCTC limits to 6)
    long countByUserId(Long userId);

    // Find a specific passenger belonging to a specific user
    // (prevents user A from accessing user B's passengers)
    Optional<Passenger> findByIdAndUserId(Long passengerId, Long userId);
}