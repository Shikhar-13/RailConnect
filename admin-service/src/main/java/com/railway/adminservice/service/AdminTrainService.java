package com.railway.adminservice.service;

import com.railway.adminservice.client.TrainServiceClient;
import com.railway.adminservice.dto.ApiResponse;
import com.railway.adminservice.dto.TrainDetailDto;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminTrainService {

    private final TrainServiceClient trainServiceClient;

    public TrainDetailDto createTrain(TrainDetailDto trainDto) {
        ApiResponse<TrainDetailDto> response = trainServiceClient.createTrain(trainDto);
        return response.getData();
    }

    public TrainDetailDto updateTrain(Long id, TrainDetailDto trainDto) {
        ApiResponse<TrainDetailDto> response = trainServiceClient.updateTrain(id, trainDto);
        return response.getData();
    }

    public void addRouteStop(Long id, Object routeDto) {
        trainServiceClient.addRouteStop(id, routeDto);
    }

    public void createSchedule(Long id, Object scheduleDto) {
        trainServiceClient.createSchedule(id, scheduleDto);
    }
    public List<TrainDetailDto> getAllTrains() {
        ApiResponse<List<TrainDetailDto>> response = trainServiceClient.getAllTrains();
        return response.getData();
    }
}
