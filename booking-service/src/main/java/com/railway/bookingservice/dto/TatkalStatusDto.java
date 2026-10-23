package com.railway.bookingservice.dto;

import lombok.*;

import java.time.LocalDateTime;

/** Tatkal availability check response */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TatkalStatusDto {

    private Long scheduleId;
    private String trainNumber;
    private String classType;

    /** true when current time >= departureDateTime - 24h */
    private boolean tatkalWindowOpen;
    
    /** Current tatkal seats available (null if window not open) */
    private Integer tatkalSeats;

    /** Exact datetime when Tatkal window opens (always populated) */
    private LocalDateTime opensAt;

    /**
     * Human-readable:
     *   "Tatkal is open!"
     *   "Tatkal booking opens in 22 hrs 15 mins"
     */
    private String message;
}
