package org.splitrakam.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.splitrakam.model.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private static final String USER_JSON_FILE_PATH = "/data/users.json";
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public User createUser(String userName, String email, String rawPassword) {
        List<User> users = loadExistingUsers();

        for (User user : users) {
            if (user.getUserEmail().equalsIgnoreCase(email)) {
                throw new RuntimeException("User email already exists.");
            }
        }

        User newUser = new User();
        newUser.setUserId(UUID.randomUUID());
        newUser.setUserName(userName);
        newUser.setUserEmail(email);
        newUser.setUserPassword(bCryptPasswordEncoder.encode(rawPassword));
        newUser.setUserGroupIds(new ArrayList<>());
        newUser.setUserCreatedAt(LocalDateTime.now());

        users.add(newUser);
        saveUsers(users);

        return newUser;
    }

    private List<User> loadExistingUsers() {
        try {
            File file = new File(USER_JSON_FILE_PATH);

            if (!file.exists()) {
                return new ArrayList<>();
            }

            return objectMapper.readValue(file, new TypeReference<List<User>>() {});
        } catch (IOException e) {
            throw new RuntimeException("Failed to load users", e);
        }
    }

    private void saveUsers(List<User> users) {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(USER_JSON_FILE_PATH), users);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save user", e);
        }
    }

    public void getCurrentUser() {

    }

    public Optional<User> getUserById(UUID userId) {
        List<User> users = loadExistingUsers();

        for (User user : users) {
            if (userId.equals(user.getUserId())) {
                return Optional.of(user);
            }
        }

        return Optional.empty();
    }

    public boolean userEmailExists(String userEmail) {
        List<User> users = loadExistingUsers();

        for (User user : users) {
            if (userEmail.equals(user.getUserEmail())) {
                return true;
            }
        }

        return false;
    }

    public void updateUserProfile(String userName, String userEmail, String userPassword) {
        List<User> users = loadExistingUsers();

        for (User user : users) {
            
        }
    }

    public void deleteUserProfile() {

    }

}
