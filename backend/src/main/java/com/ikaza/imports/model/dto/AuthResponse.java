package com.ikaza.imports.model.dto;

import com.ikaza.imports.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @Builder @AllArgsConstructor
public class AuthResponse {

    private String token;         // JWT para autenticar siguientes peticiones
    private String name;
    private String email;
    private UserRole role;
}
