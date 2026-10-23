package com.railway.adminservice.controller;

import com.railway.adminservice.dto.ApiResponse;
import com.railway.adminservice.dto.UserSummaryDto;
import com.railway.adminservice.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", adminUserService.getAllUsers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getUserById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", adminUserService.getUserById(id)));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable("id") Long id) {
        adminUserService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status toggled successfully", null));
    }
}
