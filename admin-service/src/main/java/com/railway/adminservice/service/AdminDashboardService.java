package com.railway.adminservice.service;

import com.railway.adminservice.client.TrainServiceClient;
import com.railway.adminservice.client.UserServiceClient;
import com.railway.adminservice.dto.ApiResponse;
import com.railway.adminservice.dto.DashboardDto;
import com.railway.adminservice.dto.UserSummaryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserServiceClient userServiceClient;
    private final TrainServiceClient trainServiceClient;

    public DashboardDto getDashboardStats() {
        DashboardDto dashboard = new DashboardDto();
        
        try {
            ApiResponse<List<UserSummaryDto>> userResponse = userServiceClient.getAllUsers();
            if (userResponse != null && userResponse.getData() != null) {
                dashboard.setTotalUsers(userResponse.getData().size());
            }
        } catch (Exception e) {
            log.error("Failed to fetch user stats: " + e.getMessage());
            dashboard.setTotalUsers(0);
        }

        try {
            ApiResponse<String> trainResponse = trainServiceClient.getStats();
            if (trainResponse != null && trainResponse.getData() != null) {
                dashboard.setTrainStats(trainResponse.getData());
            } else {
                dashboard.setTrainStats("No stats available");
            }
        } catch (Exception e) {
            log.warn("Train service is unavailable: " + e.getMessage());
            dashboard.setTrainStats("Service Unavailable");
        }
        
        // In a real scenario, this would aggregate more data from booking and payment
        // services
        return dashboard;
    }
}
