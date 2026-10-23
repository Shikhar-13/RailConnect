package com.railway.adminservice.service;

import com.railway.adminservice.client.UserServiceClient;
import com.railway.adminservice.dto.ApiResponse;
import com.railway.adminservice.dto.UserSummaryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserServiceClient userServiceClient;

    public List<UserSummaryDto> getAllUsers() {
        try {
            ApiResponse<List<UserSummaryDto>> response = userServiceClient.getAllUsers();
            return response.getData();
        } catch (Exception e) {
            log.error("Error fetching all users from user-service: {}", e.getMessage());
            throw e;
        }
    }

    public UserSummaryDto getUserById(Long id) {
        ApiResponse<UserSummaryDto> response = userServiceClient.getUserById(id);
        return response.getData();
    }

    public void toggleUserStatus(Long id) {
        userServiceClient.toggleUserStatus(id);
    }
}
