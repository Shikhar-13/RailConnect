package com.railway.trainservice.repository;

import com.railway.trainservice.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByTrainId(Long trainId);
    Optional<Schedule> findByTrainIdAndDepartureDate(Long trainId, LocalDate departureDate);
}
