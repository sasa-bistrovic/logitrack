package com.by.sasa.bistrovic.logistics.tracking;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = {
    "https://expensetrackinghub.expense-tracking.com",
    "https://expensetrackinghub-95d6abf7a695.herokuapp.com",
    "http://localhost:8080"
})
@RequestMapping("/auth")
public class AuthController {

    //@Value("${spring.security.oauth2.client.registration.google.client-id}")
    //private String clientId;

    //@Value("${spring.security.oauth2.client.registration.google.client-secret}")
    //private String clientSecret;

    //@Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    //private String redirectUri;

    @PostMapping("/callback")
    public ResponseEntity<?> callback(@RequestParam("code") String code) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            //System.out.println(redirectUri);

            // 1. Razmijeni authorization code za access token
            String tokenUrl = "https://oauth2.googleapis.com/token";

            Map<String, String> params = new HashMap<>();
            params.put("code", code);
            params.put("client_id", "871653320177-3nh4njedu3vqt2mhg3s403jklr993l5j.apps.googleusercontent.com");//clientId);
            params.put("client_secret", "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");//clientSecret);
            params.put("redirect_uri", "https://expensetrackinghub-95d6abf7a695.herokuapp.com/auth/callback");//redirectUri);
            params.put("grant_type", "authorization_code");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(params, headers);

            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, request, Map.class);

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            // 2. Dohvati user info
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);

            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
            ResponseEntity<Map> userInfo = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    HttpMethod.GET,
                    userRequest,
                    Map.class
            );

            return ResponseEntity.ok(userInfo.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during Google OAuth: " + e.getMessage());
        }
    }
    
    @GetMapping("/callbacks")
    public String authCallback(@RequestParam String code) {
        System.out.println("Authorization code: " + code);
        return "Authorization code primljen! Možete zatvoriti ovu stranicu.";
    }
}