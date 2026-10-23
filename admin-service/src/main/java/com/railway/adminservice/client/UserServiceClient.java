package com.railway.adminservice.client;

import com.railway.adminservice.dto.ApiResponse;
import com.railway.adminservice.dto.UserSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/api/admin/users")
    ApiResponse<List<UserSummaryDto>> getAllUsers();

    @GetMapping("/api/admin/users/{id}")
    ApiResponse<UserSummaryDto> getUserById(@PathVariable("id") Long id);

    @PutMapping("/api/admin/users/{id}/toggle-status")
    ApiResponse<UserSummaryDto> toggleUserStatus(@PathVariable("id") Long id);
}
