package com.railway.bookingservice.controller;

import com.railway.bookingservice.service.CancellationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class CancellationController {

    private final CancellationService cancellationService;

    /**
     * POST /api/bookings/{pnr}/cancel
     * Cancel the entire ticket (all passengers).
     * Confirmed seats are returned to train-service.
     * Waitlisted passengers are auto-promoted.
     */
    @PostMapping("/{pnr}/cancel")
    public ResponseEntity<String> cancelTicket(
            @PathVariable String pnr,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        return ResponseEntity.ok(cancellationService.cancelTicket(pnr, userId));
    }

    /**
     * POST /api/bookings/{pnr}/cancel-passenger?passengerId=5
     * Cancel a single passenger from a group ticket.
     */
    @PostMapping("/{pnr}/cancel-passenger")
    public ResponseEntity<String> cancelPassenger(
            @PathVariable String pnr,
            @RequestParam Long passengerId,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        return ResponseEntity.ok(cancellationService.cancelPassenger(pnr, passengerId, userId));
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private Long getUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null) throw new IllegalStateException("User not authenticated");
        return ((Number) userId).longValue();
    }
}
