package com.railway.bookingservice.repository;

import com.railway.bookingservice.entity.TicketPassenger;
import com.railway.bookingservice.entity.TicketPassenger.PassengerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketPassengerRepository extends JpaRepository<TicketPassenger, Long> {

    List<TicketPassenger> findByTicketId(Long ticketId);

    /**
     * Segment overlap check for berth sharing (IRCTC rule).
     * Returns passengers who hold the same berth on overlapping segments.
     * Two segments overlap when NOT (newTo <= existingFrom OR newFrom >= existingTo).
     */
    @Query("""
        SELECT tp FROM TicketPassenger tp
        WHERE tp.ticket.scheduleId = :scheduleId
          AND tp.classType = :classType
          AND tp.coachNumber = :coachNumber
          AND tp.berthNumber = :berthNumber
          AND tp.passengerStatus <> 'CANCELLED'
          AND NOT ((:newToStop <= tp.fromStopOrder) OR (:newFromStop >= tp.toStopOrder))
        """)
    List<TicketPassenger> findConflictingBerthPassengers(
            @Param("scheduleId") Long scheduleId,
            @Param("classType") String classType,
            @Param("coachNumber") String coachNumber,
            @Param("berthNumber") Integer berthNumber,
            @Param("newFromStop") Integer newFromStop,
            @Param("newToStop") Integer newToStop
    );

    /**
     * Find all confirmed passengers on a given berth to check segment availability.
     */
    @Query("""
        SELECT tp FROM TicketPassenger tp
        WHERE tp.ticket.scheduleId = :scheduleId
          AND tp.classType = :classType
          AND tp.coachNumber = :coachNumber
          AND tp.berthNumber = :berthNumber
          AND tp.passengerStatus <> 'CANCELLED'
        ORDER BY tp.fromStopOrder ASC
        """)
    List<TicketPassenger> findBerthOccupants(
            @Param("scheduleId") Long scheduleId,
            @Param("classType") String classType,
            @Param("coachNumber") String coachNumber,
            @Param("berthNumber") Integer berthNumber
    );

    List<TicketPassenger> findByTicketIdAndPassengerStatus(Long ticketId, PassengerStatus status);
}
