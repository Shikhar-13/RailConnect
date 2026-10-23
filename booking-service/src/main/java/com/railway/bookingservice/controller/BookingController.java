package com.railway.bookingservice.controller;

import com.railway.bookingservice.dto.BookingRequest;
import com.railway.bookingservice.dto.BookingResponse;
import com.railway.bookingservice.dto.WaitlistStatusDto;
import com.railway.bookingservice.repository.WaitlistEntryRepository;
import com.railway.bookingservice.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final WaitlistEntryRepository waitlistEntryRepository;
    private final com.railway.bookingservice.repository.TicketRepository ticketRepository;

    /**
     * GET /api/bookings/health
     * Diagnostic endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        long count = ticketRepository.count();
        return ResponseEntity.ok("Booking Service is alive. Ticket count: " + count);
    }

    /**
     * POST /api/bookings
     * Book a ticket (Normal or Tatkal bookingType).
     * If no seats available, passenger is automatically waitlisted.
     */
    @PostMapping
    public ResponseEntity<BookingResponse> book(
            @Valid @RequestBody BookingRequest request,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        return ResponseEntity.ok(bookingService.book(request, userId));
    }

    /**
     * GET /api/bookings/{pnr}
     * Get ticket by PNR (only for the owner).
     */
    @GetMapping("/{pnr}")
    public ResponseEntity<BookingResponse> getByPnr(
            @PathVariable String pnr,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        return ResponseEntity.ok(bookingService.getByPnr(pnr, userId));
    }

    /**
     * GET /api/bookings/my
     * List all tickets for the authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    /**
     * GET /api/bookings/{pnr}/waitlist-status
     * Get waitlist position for a specific ticket.
     */
    @GetMapping("/{pnr}/waitlist-status")
    public ResponseEntity<WaitlistStatusDto> getWaitlistStatus(
            @PathVariable String pnr,
            @RequestParam Long ticketPassengerId,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        BookingResponse ticket = bookingService.getByPnr(pnr, userId);

        return ticket.getPassengers().stream()
                .filter(p -> ticketPassengerId.equals(p.getTicketPassengerId()))
                .findFirst()
                .map(p -> {
                    Integer totalWaiting = waitlistEntryRepository.countWaiting(
                            ticket.getScheduleId(), 0L); // seatClassId simplified
                    return ResponseEntity.ok(WaitlistStatusDto.builder()
                            .pnrNumber(pnr)
                            .passengerId(ticketPassengerId) // Reusing field name in WaitlistStatusDto for backward compatibility
                            .queuePosition(p.getWaitlistPosition())
                            .totalWaiting(totalWaiting)
                            .status(p.getPassengerStatus())
                            .message("You are at position " + p.getWaitlistPosition()
                                    + " out of " + totalWaiting + " in the waitlist.")
                            .build());
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * POST /api/bookings/{pnr}/confirm
     * Confirm a booking after successful payment.
     */
    @PostMapping("/{pnr}/confirm")
    public ResponseEntity<BookingResponse> confirmPayment(
            @PathVariable String pnr,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        return ResponseEntity.ok(bookingService.confirmPayment(pnr, userId));
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private Long getUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null)
            throw new IllegalStateException("User not authenticated");
        return ((Number) userId).longValue();
    }
}
