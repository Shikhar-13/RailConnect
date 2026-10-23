package com.railway.adminservice.controller;

import com.railway.adminservice.dto.ApiResponse;
import com.railway.adminservice.dto.UserSummaryDto;
import com.railway.adminservice.service.AdminUserService;
import com.railway.adminservice.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminUserController.class)
@Import({com.railway.adminservice.config.SecurityConfig.class, com.railway.adminservice.security.JwtAuthenticationFilter.class})
public class AdminUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminUserService adminUserService;

    @MockBean
    private JwtService jwtService;

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    public void testGetAllUsers_AdminAccess() throws Exception {
        UserSummaryDto user = new UserSummaryDto();
        user.setId(1L);
        user.setEmail("test@example.com");

        when(adminUserService.getAllUsers()).thenReturn(Collections.singletonList(user));

        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(authorities = "ROLE_USER")
    public void testGetAllUsers_ForbiddenForUser() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }
}
