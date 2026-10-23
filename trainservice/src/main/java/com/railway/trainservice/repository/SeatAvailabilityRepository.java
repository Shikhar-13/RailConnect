package com.railway.trainservice.repository;

import com.railway.trainservice.entity.SeatAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatAvailabilityRepository extends JpaRepository<SeatAvailability, Long> {
    List<SeatAvailability> findByScheduleId(Long scheduleId);
}
