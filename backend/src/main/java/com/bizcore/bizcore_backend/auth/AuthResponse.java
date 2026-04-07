package com.bizcore.bizcore_backend.auth;

import java.util.Set;

public class AuthResponse {

    private String token;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;

    public AuthResponse(String token, String email, String firstName, String lastName, Set<String> roles) {
        this.token = token;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.roles = roles;
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public Set<String> getRoles() { return roles; }
}
