package com.railway.bookingservice.client;

import com.railway.bookingservice.dto.PassengerDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for user-service internal endpoints.
 * Fetches passenger details by ID to snapshot into TicketPassenger at booking time.
 */
@FeignClient(name = "user-service", path = "/api/internal")
public interface UserServiceClient {

    @GetMapping("/passengers/{passengerId}")
    PassengerDto getPassenger(@PathVariable("passengerId") Long passengerId);
}
