package com.railway.adminservice.controller;

import com.railway.adminservice.dto.ApiResponse;
import com.railway.adminservice.dto.DashboardDto;
import com.railway.adminservice.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched successfully", adminDashboardService.getDashboardStats()));
    }
}
