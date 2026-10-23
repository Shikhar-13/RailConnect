package com.railway.trainservice.controller;

import com.railway.trainservice.dto.ApiResponse;
import com.railway.trainservice.dto.StationDto;
import com.railway.trainservice.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class PublicStationController {

    private final StationService stationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StationDto>>> getAllStations() {
        return ResponseEntity.ok(ApiResponse.success("Stations fetched successfully", stationService.getAllStations()));
    }
}
