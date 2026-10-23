package com.railway.adminservice.controller;

import com.railway.adminservice.dto.TrainDetailDto;
import com.railway.adminservice.service.AdminTrainService;
import com.railway.adminservice.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminTrainController.class)
@Import({com.railway.adminservice.config.SecurityConfig.class, com.railway.adminservice.security.JwtAuthenticationFilter.class})
public class AdminTrainControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminTrainService adminTrainService;

    @MockBean
    private JwtService jwtService;

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    public void testCreateTrain_AdminAccess() throws Exception {
        TrainDetailDto trainDto = new TrainDetailDto();
        trainDto.setTrainNumber("12345");

        when(adminTrainService.createTrain(any(TrainDetailDto.class))).thenReturn(trainDto);

        mockMvc.perform(post("/api/admin/trains")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"trainNumber\":\"12345\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(authorities = "ROLE_USER")
    public void testCreateTrain_ForbiddenForUser() throws Exception {
        mockMvc.perform(post("/api/admin/trains")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"trainNumber\":\"12345\"}"))
                .andExpect(status().isForbidden());
    }
}
