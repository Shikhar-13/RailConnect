package com.railway.trainservice.controller;

import com.railway.trainservice.dto.ApiResponse;
import com.railway.trainservice.dto.RouteDto;
import com.railway.trainservice.dto.ScheduleDto;
import com.railway.trainservice.dto.StationDto;
import com.railway.trainservice.dto.TrainDto;
import com.railway.trainservice.dto.SeatAvailabilityDto;
import com.railway.trainservice.service.RouteService;
import com.railway.trainservice.service.ScheduleService;
import com.railway.trainservice.service.StationService;
import com.railway.trainservice.service.TrainService;
import com.railway.trainservice.service.SeatAvailabilityService;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class InternalTrainController {

    private final StationService stationService;
    private final TrainService trainService;
    private final RouteService routeService;
    private final ScheduleService scheduleService;
    private final SeatAvailabilityService seatAvailabilityService;

    // Stations
    @PostMapping("/stations")
    public ResponseEntity<ApiResponse<StationDto>> addStation(@jakarta.validation.Valid @RequestBody StationDto stationDto) {
        return new ResponseEntity<>(ApiResponse.success("Station created successfully", stationService.createStation(stationDto)), HttpStatus.CREATED);
    }

    // Trains
    @PostMapping("/trains")
    public ResponseEntity<ApiResponse<TrainDto>> createTrain(@jakarta.validation.Valid @RequestBody TrainDto trainDto) {
        return new ResponseEntity<>(ApiResponse.success("Train created successfully", trainService.createTrain(trainDto)), HttpStatus.CREATED);
    }

    @GetMapping("/trains")
    public ResponseEntity<ApiResponse<List<TrainDto>>> getAllTrains() {
        return ResponseEntity.ok(ApiResponse.success("Trains fetched successfully", trainService.getAllTrains()));
    }

    @PutMapping("/trains/{id}")
    public ResponseEntity<ApiResponse<TrainDto>> updateTrain(@PathVariable("id") Long id, @jakarta.validation.Valid @RequestBody TrainDto trainDto) {
        return ResponseEntity.ok(ApiResponse.success("Train updated successfully", trainService.updateTrainDetail(id, trainDto)));
    }

    // Routes
    @PostMapping("/trains/{id}/routes")
    public ResponseEntity<ApiResponse<RouteDto>> addRouteStop(@PathVariable("id") Long id, @jakarta.validation.Valid @RequestBody RouteDto routeDto) {
        return new ResponseEntity<>(ApiResponse.success("Route stop added successfully", routeService.addRoute(id, routeDto)), HttpStatus.CREATED);
    }

    // Schedules
    @PostMapping("/trains/{id}/schedules")
    public ResponseEntity<ApiResponse<ScheduleDto>> createSchedule(@PathVariable("id") Long id, @jakarta.validation.Valid @RequestBody ScheduleDto scheduleDto) {
        return new ResponseEntity<>(ApiResponse.success("Schedule created successfully", scheduleService.createSchedule(id, scheduleDto)), HttpStatus.CREATED);
    }

    // --- Booking Service Support (Seat Availability) ---

    private final com.railway.trainservice.repository.SeatAvailabilityRepository seatAvailabilityRepository;
    private final com.railway.trainservice.repository.ScheduleRepository scheduleRepository;

    @GetMapping("/seat-availability/{scheduleId}/{classType}")  
    public ResponseEntity<SeatAvailabilityDto> getSeatAvailability(
            @PathVariable Long scheduleId,
            @PathVariable String classType
    ) {
        return ResponseEntity.ok(seatAvailabilityService.getAvailability(scheduleId, classType));
    }
    @PostMapping("/seat-availability/decrement")
    public ResponseEntity<Void> decrementSeat(
            @RequestParam Long scheduleId,
            @RequestParam String classType,
            @RequestParam int count,
            @RequestParam(defaultValue = "NORMAL") String bookingType
    ) {
        seatAvailabilityService.decrement(scheduleId, classType, count, bookingType);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/seat-availability/increment")
    public ResponseEntity<Void> incrementSeat(
            @RequestParam Long scheduleId,
            @RequestParam String classType,
            @RequestParam int count,
            @RequestParam(defaultValue = "NORMAL") String bookingType
    ) {
        seatAvailabilityService.increment(scheduleId, classType, count, bookingType);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/schedules/{scheduleId}/departure-datetime")
    public ResponseEntity<String> getDepartureDatetime(@PathVariable("scheduleId") Long scheduleId) {
        var schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new com.railway.trainservice.exception.ResourceNotFoundException("Schedule not found"));
        return ResponseEntity.ok(schedule.getDepartureDate().atTime(8, 0).toString());
    }

    // Stats (Dashboard mock endpoint)
    @GetMapping("/trains/stats")
    public ResponseEntity<ApiResponse<String>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats fetched successfully", "Active trains: N/A, Total bookings: N/A"));
    }
}
