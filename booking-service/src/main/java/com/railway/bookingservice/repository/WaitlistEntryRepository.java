package com.railway.bookingservice.repository;

import com.railway.bookingservice.entity.WaitlistEntry;
import com.railway.bookingservice.entity.WaitlistEntry.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, Long> {

    List<WaitlistEntry> findByScheduleIdAndSeatClassIdAndStatusOrderByQueuePositionAsc(
            Long scheduleId, Long seatClassId, WaitlistStatus status);

    Optional<WaitlistEntry> findFirstByScheduleIdAndSeatClassIdAndStatusOrderByQueuePositionAsc(
            Long scheduleId, Long seatClassId, WaitlistStatus status);

    @Query("SELECT COUNT(w) FROM WaitlistEntry w WHERE w.scheduleId = :scheduleId " +
           "AND w.seatClassId = :seatClassId AND w.status = 'WAITING'")
    Integer countWaiting(@Param("scheduleId") Long scheduleId,
                         @Param("seatClassId") Long seatClassId);

    Optional<WaitlistEntry> findByTicketPassengerId(Long ticketPassengerId);
}
