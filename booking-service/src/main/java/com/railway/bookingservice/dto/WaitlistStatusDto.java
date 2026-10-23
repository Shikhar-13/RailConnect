package com.railway.bookingservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaitlistStatusDto {

    private String pnrNumber;
    private Long passengerId;
    private Integer queuePosition;
    private Integer totalWaiting;
    private String status;
    private String message;
}
