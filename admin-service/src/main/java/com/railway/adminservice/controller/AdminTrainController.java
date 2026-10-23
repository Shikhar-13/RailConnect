package com.railway.adminservice.controller;

import com.railway.adminservice.dto.ApiResponse;
import com.railway.adminservice.dto.TrainDetailDto;
import com.railway.adminservice.service.AdminTrainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/admin/trains")
@RequiredArgsConstructor
public class AdminTrainController {
    
        private final AdminTrainService adminTrainService;

        @GetMapping
        public ResponseEntity<ApiResponse<List<TrainDetailDto>>> getAllTrains() {
            return ResponseEntity.ok(ApiResponse.success("Trains fetched successfully", adminTrainService.getAllTrains()));
        }
    
        @PostMapping
        public ResponseEntity<ApiResponse<TrainDetailDto>> createTrain(@RequestBody TrainDetailDto trainDto) {
            log.info("Received request to create train: {}", trainDto);
            return new ResponseEntity<>(ApiResponse.success("Train created successfully", adminTrainService.createTrain(trainDto)), HttpStatus.CREATED);
        }
    
        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<TrainDetailDto>> updateTrain(@PathVariable("id") Long id, @RequestBody TrainDetailDto trainDto) {
            log.info("Received request to update train {}: {}", id, trainDto);
            return ResponseEntity.ok(ApiResponse.success("Train updated successfully", adminTrainService.updateTrain(id, trainDto)));
        }

    @PostMapping("/{id}/routes")
    public ResponseEntity<ApiResponse<Void>> addRouteStop(@PathVariable("id") Long id, @RequestBody Object routeDto) {
        adminTrainService.addRouteStop(id, routeDto);
        return new ResponseEntity<>(ApiResponse.success("Route stop added successfully", null), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/schedules")
    public ResponseEntity<ApiResponse<Void>> createSchedule(@PathVariable("id") Long id, @RequestBody Object scheduleDto) {
        adminTrainService.createSchedule(id, scheduleDto);
        return new ResponseEntity<>(ApiResponse.success("Schedule created successfully", null), HttpStatus.CREATED);
    }
}
