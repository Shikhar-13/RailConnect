package com.railway.adminservice.client;

import com.railway.adminservice.dto.ApiResponse;
import com.railway.adminservice.dto.TrainDetailDto;
import org.springframework.cloud.openfeign.FeignClient;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "trainservice")
public interface TrainServiceClient {

    @PostMapping("/api/internal/trains")
    ApiResponse<TrainDetailDto> createTrain(@RequestBody TrainDetailDto trainDto);

    @GetMapping("/api/internal/trains")
    ApiResponse<List<TrainDetailDto>> getAllTrains();

    @PutMapping("/api/internal/trains/{id}")
    ApiResponse<TrainDetailDto> updateTrain(@PathVariable("id") Long id, @RequestBody TrainDetailDto trainDto);

    @PostMapping("/api/internal/trains/{id}/routes")
    ApiResponse<Void> addRouteStop(@PathVariable("id") Long id, @RequestBody Object routeDto);

    @PostMapping("/api/internal/trains/{id}/schedules")
    ApiResponse<Void> createSchedule(@PathVariable("id") Long id, @RequestBody Object scheduleDto);
    
    @GetMapping("/api/internal/trains/stats")
    ApiResponse<String> getStats();
}
