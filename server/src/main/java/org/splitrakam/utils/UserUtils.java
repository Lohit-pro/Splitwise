package org.splitrakam.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.splitrakam.model.User;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class UserUtils {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String USER_JSON_FILE_PATH = "/data/users.json";

    public List<User> loadExistingUsers() {
        try {
            File file = new File(USER_JSON_FILE_PATH);

            if (!file.exists()) {
                throw new IOException("File not present!");
            }

            return objectMapper.readValue(file, new TypeReference<List<User>>() {});
        } catch (IOException e) {
            throw new RuntimeException("Failed to load users", e);
        }
    }

    public void saveUsers(List<User> users) {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(USER_JSON_FILE_PATH), users);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save new user", e);
        }
    }

    public boolean userEmailExists(String userEmail) {
        List<User> users = loadExistingUsers();

        for (User user : users) {
            if (userEmail.equalsIgnoreCase(user.getUserEmail())) {
                return true;
            }
        }

        return false;
    }

}
