package com.railway.trainservice.service;

import com.railway.trainservice.dto.SeatAvailabilityDto;
import com.railway.trainservice.entity.SeatAvailability;
import com.railway.trainservice.exception.ResourceNotFoundException;
import com.railway.trainservice.repository.SeatAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SeatAvailabilityService {

    private final SeatAvailabilityRepository seatAvailabilityRepository;

    // ---------- GET availability (DTO) ----------
    @Transactional(readOnly = true)
    public SeatAvailabilityDto getAvailability(Long scheduleId, String classType) {

        SeatAvailability sa = getEntity(scheduleId, classType);

        return SeatAvailabilityDto.builder()
                .id(sa.getId())
                .scheduleId(sa.getSchedule().getId())
                .seatClassId(sa.getSeatClass().getId())
                .classType(sa.getSeatClass().getClassType())
                .availableSeats(sa.getAvailableSeats())
                .tatkalSeats(sa.getTatkalSeats())
                .racSeats(sa.getRacSeats())
                .waitlistCount(sa.getWaitlistCount())
                .build();
    }

    // ---------- INTERNAL: load entity inside transaction ----------
    @Transactional(readOnly = true)
    public SeatAvailability getEntity(Long scheduleId, String classType) {

        return seatAvailabilityRepository.findByScheduleId(scheduleId)
                .stream()
                .filter(sa -> sa.getSeatClass().getClassType().equalsIgnoreCase(classType))
                .findFirst()
                .orElseThrow(() ->
                        new ResourceNotFoundException("Seat availability not found"));
    }

    // ---------- DECREMENT seats ----------
    @Transactional
    public void decrement(Long scheduleId, String classType, int count, String bookingType) {

        SeatAvailability sa = getEntity(scheduleId, classType);

        if ("TATKAL".equalsIgnoreCase(bookingType)) {
            sa.setTatkalSeats(sa.getTatkalSeats() - count);
        } else {
            sa.setAvailableSeats(sa.getAvailableSeats() - count);
        }

        seatAvailabilityRepository.save(sa);
    }

    // ---------- INCREMENT seats ----------
    @Transactional
    public void increment(Long scheduleId, String classType, int count, String bookingType) {

        SeatAvailability sa = getEntity(scheduleId, classType);

        if ("TATKAL".equalsIgnoreCase(bookingType)) {
            sa.setTatkalSeats(sa.getTatkalSeats() + count);
        } else {
            sa.setAvailableSeats(sa.getAvailableSeats() + count);
        }

        seatAvailabilityRepository.save(sa);
    }
}