package com.example.smartweldbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartWeldBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartWeldBackendApplication.class, args);
    }

}
