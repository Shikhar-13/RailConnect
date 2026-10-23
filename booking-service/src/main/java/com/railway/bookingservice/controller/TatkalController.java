package com.railway.bookingservice.controller;

import com.railway.bookingservice.dto.TatkalStatusDto;
import com.railway.bookingservice.service.TatkalService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tatkal")
@RequiredArgsConstructor
public class TatkalController {

    private final TatkalService tatkalService;

    /**
     * GET /api/tatkal/status?scheduleId=1&classType=SL
     * PUBLIC — no auth needed.
     * Returns whether Tatkal window is open and (if not) when it opens.
     */
    @GetMapping("/status")
    public ResponseEntity<TatkalStatusDto> getTatkalStatus(
            @RequestParam Long scheduleId,
            @RequestParam String classType) {
        return ResponseEntity.ok(tatkalService.getTatkalStatus(scheduleId, classType));
    }

    /**
     * POST /api/tatkal/join
     * Join the Tatkal queue (auth required).
     * Throws TatkalWindowNotOpenException (400) with opensAt if window is closed.
     */
    @PostMapping("/join")
    public ResponseEntity<String> joinTatkalQueue(
            @RequestParam Long scheduleId,
            @RequestParam Long seatClassId,
            @RequestParam String classType,
            @RequestParam Long fromStationId,
            @RequestParam Long toStationId,
            @RequestParam String passengerDetailsJson,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        String result = tatkalService.joinTatkalQueue(
                scheduleId, seatClassId, classType,
                userId, fromStationId, toStationId, passengerDetailsJson);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/tatkal/queue-position?scheduleId=1&seatClassId=3
     * Returns the logged-in user's current Tatkal queue position.
     */
    @GetMapping("/queue-position")
    public ResponseEntity<String> getQueuePosition(
            @RequestParam Long scheduleId,
            @RequestParam Long seatClassId,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        return ResponseEntity.ok(tatkalService.getQueuePosition(scheduleId, seatClassId, userId));
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private Long getUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null) throw new IllegalStateException("User not authenticated");
        return ((Number) userId).longValue();
    }
}
