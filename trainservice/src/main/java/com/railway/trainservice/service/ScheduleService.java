package com.railway.trainservice.service;

import com.railway.trainservice.dto.ScheduleDto;
import com.railway.trainservice.dto.SeatAvailabilityDto;
import com.railway.trainservice.entity.Schedule;
import com.railway.trainservice.entity.SeatAvailability;
import com.railway.trainservice.entity.SeatClass;
import com.railway.trainservice.entity.Train;
import com.railway.trainservice.exception.DuplicateResourceException;
import com.railway.trainservice.exception.ResourceNotFoundException;
import com.railway.trainservice.repository.ScheduleRepository;
import com.railway.trainservice.repository.SeatAvailabilityRepository;
import com.railway.trainservice.repository.SeatClassRepository;
import com.railway.trainservice.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final TrainRepository trainRepository;
    private final SeatClassRepository seatClassRepository;
    private final SeatAvailabilityRepository seatAvailabilityRepository;

    @Transactional
    public ScheduleDto createSchedule(Long trainId, ScheduleDto scheduleDto) {
        Train train = trainRepository.findById(trainId)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found with id: " + trainId));

        // Idempotency check
        if (scheduleRepository.findByTrainIdAndDepartureDate(trainId, scheduleDto.getDepartureDate()).isPresent()) {
            throw new DuplicateResourceException("Schedule for train " + train.getTrainNumber() + " on " + scheduleDto.getDepartureDate() + " already exists.");
        }

        Schedule schedule = Schedule.builder()
                .train(train)
                .departureDate(scheduleDto.getDepartureDate())
                .status("SCHEDULED")
                .build();

        Schedule savedSchedule = scheduleRepository.save(schedule);

        // Auto-create Seat Availability
        List<SeatClass> seatClasses = seatClassRepository.findByTrainId(trainId);
        if (seatClasses.isEmpty()) {
            throw new IllegalStateException("Cannot create schedule: Train has no seat classes defined.");
        }

        List<SeatAvailability> availabilities = seatClasses.stream().map(seatClass -> {
            int total = seatClass.getTotalSeats();
            int tatkal = Math.max(1, (int)(total * 0.20));
            int avail = total - tatkal;
            return SeatAvailability.builder()
                    .schedule(savedSchedule)
                    .seatClass(seatClass)
                    .availableSeats(avail)
                    .tatkalSeats(tatkal)
                    .racSeats(0)
                    .waitlistCount(0)
                    .build();
        }).collect(Collectors.toList());

        seatAvailabilityRepository.saveAll(availabilities);

        savedSchedule.setSeatAvailabilities(availabilities);
        return mapToDto(savedSchedule);
    }
    @Transactional(readOnly = true)
    public ScheduleDto getScheduleById(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));
        return mapToDto(schedule);
    }
    
    @Transactional(readOnly = true)
    public List<ScheduleDto> getSchedulesByTrainId(Long trainId) {
        return scheduleRepository.findByTrainId(trainId).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private ScheduleDto mapToDto(Schedule schedule) {

        List<SeatAvailabilityDto> availabilityDtos = null;

        if (schedule.getSeatAvailabilities() != null) {
            availabilityDtos = schedule.getSeatAvailabilities().stream()
                    .map(av -> SeatAvailabilityDto.builder()
                            .id(av.getId())
                            .scheduleId(schedule.getId())
                            .seatClassId(av.getSeatClass().getId())
                            .classType(av.getSeatClass().getClassType())
                            .availableSeats(av.getAvailableSeats())
                            .tatkalSeats(av.getTatkalSeats())
                            .racSeats(av.getRacSeats())
                            .waitlistCount(av.getWaitlistCount())
                            .build()
                    ).collect(Collectors.toList());
        }

        return ScheduleDto.builder()
                .id(schedule.getId())
                .departureDate(schedule.getDepartureDate())
                .status(schedule.getStatus())
                .seatAvailabilities(availabilityDtos)
                .build();
    }
}
