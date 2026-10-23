package com.railway.userservice.controller;

import com.railway.userservice.entity.Passenger;
import com.railway.userservice.repository.PassengerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class InternalUserController {

    private final PassengerRepository passengerRepository;

    @GetMapping("/passengers/{passengerId}")
    public ResponseEntity<Passenger> getPassenger(@PathVariable Long passengerId) {
        return passengerRepository.findById(passengerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
