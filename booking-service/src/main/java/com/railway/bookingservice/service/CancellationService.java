package com.railway.bookingservice.service;

import com.railway.bookingservice.client.PaymentServiceClient;
import com.railway.bookingservice.client.TrainServiceClient;
import com.railway.bookingservice.entity.Ticket;
import com.railway.bookingservice.entity.Ticket.TicketStatus;
import com.railway.bookingservice.entity.TicketPassenger;
import com.railway.bookingservice.entity.TicketPassenger.PassengerStatus;
import com.railway.bookingservice.exception.BookingException;
import com.railway.bookingservice.exception.ResourceNotFoundException;
import com.railway.bookingservice.repository.TicketPassengerRepository;
import com.railway.bookingservice.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CancellationService {

    private final TicketRepository ticketRepository;
    private final TicketPassengerRepository ticketPassengerRepository;
    private final TrainServiceClient trainServiceClient;
    private final WaitlistService waitlistService;
    private final PaymentServiceClient paymentServiceClient;

    // ─────────────────────────────────────────────────────────────────────────
    //  CANCEL FULL TICKET (all passengers)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public String cancelTicket(String pnrNumber, Long userId) {
        Ticket ticket = ticketRepository.findByPnrNumber(pnrNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with PNR: " + pnrNumber));

        // Ownership check
        if (!ticket.getUserId().equals(userId)) {
            throw new BookingException("Access denied: this ticket does not belong to you");
        }

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new BookingException("Ticket is already cancelled");
        }

        // Trigger Refund if payment was made
        if (ticket.getStatus() == TicketStatus.CONFIRMED || ticket.getStatus() == TicketStatus.WAITLISTED) {
            try {
                paymentServiceClient.refundPayment(pnrNumber, ticket.getStripePaymentIntentId(), ticket.getTotalFare());
                log.info("Full refund initiated for PNR: {}", pnrNumber);
            } catch (Exception e) {
                log.error("Failed to initiate refund for PNR: {}", pnrNumber, e);
            }
        }

        List<TicketPassenger> passengers = ticketPassengerRepository.findByTicketId(ticket.getId());
        String classType = passengers.isEmpty() ? "SL" : passengers.get(0).getClassType();

        // Count how many confirmed passengers are being cancelled
        long confirmedCount = passengers.stream()
                .filter(p -> p.getPassengerStatus() == PassengerStatus.CONFIRMED)
                .count();

        // Cancel all passengers
        passengers.forEach(p -> p.setPassengerStatus(PassengerStatus.CANCELLED));
        ticketPassengerRepository.saveAll(passengers);

        // Cancel ticket
        ticket.setStatus(TicketStatus.CANCELLED);
        ticket.setCancellationTime(LocalDateTime.now());
        ticketRepository.save(ticket);

        // Return seats to train-service for confirmed passengers only
        if (confirmedCount > 0) {
            trainServiceClient.incrementSeat(ticket.getScheduleId(), classType, (int) confirmedCount, ticket.getBookingType().name());
            log.info("Released {} seats for scheduleId={}, class={}", confirmedCount, ticket.getScheduleId(), classType);

            // Promote waitlisted passengers for each freed seat
            for (int i = 0; i < confirmedCount; i++) {
                // seatClassId: would be fetched from train-service; using 0L as placeholder
                waitlistService.promoteNext(ticket.getScheduleId(), 0L, classType);
            }
        }

        return "Ticket with PNR " + pnrNumber + " has been successfully cancelled. " +
               (confirmedCount > 0 ? confirmedCount + " seat(s) released; waitlisted passengers notified." : "");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  CANCEL INDIVIDUAL PASSENGER from a ticket
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public String cancelPassenger(String pnrNumber, Long passengerId, Long userId) {
        Ticket ticket = ticketRepository.findByPnrNumber(pnrNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with PNR: " + pnrNumber));

        if (!ticket.getUserId().equals(userId)) {
            throw new BookingException("Access denied: this ticket does not belong to you");
        }

        TicketPassenger tp = ticketPassengerRepository.findByTicketId(ticket.getId()).stream()
                .filter(p -> p.getPassengerId().equals(passengerId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Passenger " + passengerId + " not found on ticket " + pnrNumber));

        if (tp.getPassengerStatus() == PassengerStatus.CANCELLED) {
            throw new BookingException("Passenger is already cancelled on this ticket");
        }

        boolean wasConfirmed = tp.getPassengerStatus() == PassengerStatus.CONFIRMED;
        tp.setPassengerStatus(PassengerStatus.CANCELLED);
        ticketPassengerRepository.save(tp);

        // If this was the last non-cancelled passenger, cancel the ticket too
        boolean allCancelled = ticketPassengerRepository.findByTicketId(ticket.getId()).stream()
                .allMatch(p -> p.getPassengerStatus() == PassengerStatus.CANCELLED);
        if (allCancelled) {
            ticket.setStatus(TicketStatus.CANCELLED);
            ticket.setCancellationTime(LocalDateTime.now());
            ticketRepository.save(ticket);
        }

        if (wasConfirmed) {
            String classType = tp.getClassType();
            trainServiceClient.incrementSeat(ticket.getScheduleId(), classType, 1, ticket.getBookingType().name());
            waitlistService.promoteNext(ticket.getScheduleId(), 0L, classType);
            
            // Partial refund (simplified: proportional to total fare / passenger count)
            try {
                int totalPassengers = ticketPassengerRepository.findByTicketId(ticket.getId()).size();
                java.math.BigDecimal refundAmount = ticket.getTotalFare().divide(java.math.BigDecimal.valueOf(totalPassengers), 2, java.math.RoundingMode.HALF_UP);
                paymentServiceClient.refundPayment(pnrNumber, ticket.getStripePaymentIntentId(), refundAmount);
                log.info("Partial refund initiated for PNR: {}, Passenger: {}", pnrNumber, passengerId);
            } catch (Exception e) {
                log.error("Failed to initiate partial refund for PNR: {}", pnrNumber, e);
            }
        }

        return "Passenger " + tp.getFirstName() + " " + tp.getLastName() +
               " has been removed from ticket " + pnrNumber + ". Refund initiated if confirmed.";
    }
}
