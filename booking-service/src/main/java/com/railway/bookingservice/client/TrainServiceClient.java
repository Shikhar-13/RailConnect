package com.railway.bookingservice.client;

import com.railway.bookingservice.dto.SeatAvailabilityDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

/**
 * Feign client for talking to train-service's internal endpoints.
 * All calls go directly via Eureka (lb://trainservice) — not through gateway.
 */
@FeignClient(name = "trainservice", path = "/api/internal")
public interface TrainServiceClient {

    /** Get current seat availability for a schedule + class */
    @GetMapping("/seat-availability/{scheduleId}/{classType}")
    SeatAvailabilityDto getSeatAvailability(
            @PathVariable("scheduleId") Long scheduleId,
            @PathVariable("classType") String classType
    );

    /** Decrement available seats (called on booking confirmation) */
    @PostMapping("/seat-availability/decrement")
    void decrementSeat(
            @RequestParam("scheduleId") Long scheduleId,
            @RequestParam("classType") String classType,
            @RequestParam("count") int count,
            @RequestParam("bookingType") String bookingType
    );

    /** Increment available seats (called on cancellation) */
    @PostMapping("/seat-availability/increment")
    void incrementSeat(
            @RequestParam("scheduleId") Long scheduleId,
            @RequestParam("classType") String classType,
            @RequestParam("count") int count,
            @RequestParam("bookingType") String bookingType
    );

    /** Get schedule departure datetime string (ISO format) */
    @GetMapping("/schedules/{scheduleId}/departure-datetime")
    String getDepartureDatetime(@PathVariable("scheduleId") Long scheduleId);
}
