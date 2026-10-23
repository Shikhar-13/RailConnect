package com.railway.trainservice.controller;

import com.railway.trainservice.dto.ApiResponse;
import com.railway.trainservice.dto.RouteDto;
import com.railway.trainservice.dto.ScheduleDto;
import com.railway.trainservice.dto.TrainSearchDto;
import com.railway.trainservice.service.RouteService;
import com.railway.trainservice.service.ScheduleService;
import com.railway.trainservice.service.TrainSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trains")
@RequiredArgsConstructor
public class PublicTrainController {

    private final TrainSearchService trainSearchService;
    private final ScheduleService scheduleService;
    private final RouteService routeService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<TrainSearchDto>> searchTrains(
            @RequestParam("from") String from,
            @RequestParam("to") String to,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity
                .ok(ApiResponse.success("Search successful", trainSearchService.searchTrains(from, to, date)));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<List<ScheduleDto>>> getTrainAvailability(
            @PathVariable("id") Long id,
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<ScheduleDto> schedules = scheduleService.getSchedulesByTrainId(id);
        if (date != null) {
            schedules = schedules.stream()
                    .filter(s -> s.getDepartureDate().equals(date))
                    .toList();
        }

        return ResponseEntity.ok(ApiResponse.success("Availability fetched successfully", schedules));
    }

    @GetMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<List<RouteDto>>> getTrainRouteSchedule(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success("Train route fetched successfully", routeService.getRoutesByTrainId(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TrainSearchDto.TrainSummaryDto>>> getAllTrains() {
        return ResponseEntity.ok(
                ApiResponse.success("Trains fetched successfully", trainSearchService.getAllTrains()));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<TrainSearchDto.TrainSummaryDto>>> getFeaturedTrains() {
        return ResponseEntity.ok(
                ApiResponse.success("Featured trains fetched successfully", trainSearchService.getFeaturedTrains()));
    }
}
