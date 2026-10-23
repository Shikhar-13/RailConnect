package com.railway.bookingservice.repository;

import com.railway.bookingservice.entity.TatkalQueue;
import com.railway.bookingservice.entity.TatkalQueue.TatkalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TatkalQueueRepository extends JpaRepository<TatkalQueue, Long> {

    List<TatkalQueue> findByScheduleIdAndSeatClassIdAndStatusOrderByQueuePositionAsc(
            Long scheduleId, Long seatClassId, TatkalStatus status);

    Optional<TatkalQueue> findFirstByScheduleIdAndSeatClassIdAndStatusOrderByQueuePositionAsc(
            Long scheduleId, Long seatClassId, TatkalStatus status);

    Integer countByScheduleIdAndSeatClassIdAndStatus(
            Long scheduleId, Long seatClassId, TatkalStatus status);

    Optional<TatkalQueue> findByUserIdAndScheduleIdAndSeatClassIdAndStatus(
            Long userId, Long scheduleId, Long seatClassId, TatkalStatus status);

    /** All PENDING entries across all schedules – used by the scheduler */
    List<TatkalQueue> findByStatus(TatkalStatus status);
}
