package com.example.smartweldbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class EnvConfig {

    @PostConstruct
    public void loadEnvFile() {
        try {
            // Try to load from project root directory
            Path envPath = Paths.get(".env");
            if (!Files.exists(envPath)) {
                // Try from current working directory
                envPath = Paths.get(System.getProperty("user.dir"), ".env");
            }
            
            if (Files.exists(envPath)) {
                try (BufferedReader reader = Files.newBufferedReader(envPath)) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        // Skip empty lines and comments
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        
                        // Parse KEY=VALUE format
                        int equalsIndex = line.indexOf('=');
                        if (equalsIndex > 0) {
                            String key = line.substring(0, equalsIndex).trim();
                            String value = line.substring(equalsIndex + 1).trim();
                            
                            // Remove quotes if present
                            if (value.startsWith("\"") && value.endsWith("\"")) {
                                value = value.substring(1, value.length() - 1);
                            } else if (value.startsWith("'") && value.endsWith("'")) {
                                value = value.substring(1, value.length() - 1);
                            }
                            
                            // Set as system property if not already set
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    System.out.println("Loaded environment variables from .env file");
                }
            }
        } catch (IOException e) {
            // .env file not found or couldn't be read - that's okay
            System.out.println("No .env file found, using system environment variables");
        }
    }
}

