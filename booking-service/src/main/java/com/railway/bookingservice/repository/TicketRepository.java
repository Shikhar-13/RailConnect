package com.railway.bookingservice.repository;

import com.railway.bookingservice.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByPnrNumber(String pnrNumber);

    List<Ticket> findByUserId(Long userId);

    List<Ticket> findByScheduleId(Long scheduleId);
}
