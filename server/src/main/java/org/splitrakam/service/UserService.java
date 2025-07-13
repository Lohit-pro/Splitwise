package org.splitrakam.service;

import org.splitrakam.model.User;
import org.splitrakam.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    UserUtils userUtils;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    public User createUser(String userName, String email, String rawPassword) {
        List<User> users = userUtils.loadExistingUsers();

        if (userUtils.userEmailExists(email)) {
            throw new RuntimeException("User email already exists.");
        }

        User newUser = new User();
        newUser.setUserId(UUID.randomUUID());
        newUser.setUserName(userName);
        newUser.setUserEmail(email);
        newUser.setUserPassword(bCryptPasswordEncoder.encode(rawPassword));
        newUser.setUserGroupIds(new ArrayList<>());
        newUser.setUserCreatedAt(LocalDateTime.now());

        users.add(newUser);
        userUtils.saveUsers(users);

        return newUser;
    }

    public Optional<User> getUserById(UUID userId) {
        List<User> users = userUtils.loadExistingUsers();

        for (User user : users) {
            if (userId.equals(user.getUserId())) {
                return Optional.of(user);
            }
        }

        return Optional.empty();
    }

    public void updateUser(UUID userId, String userName, String userEmail, String userPassword) {
        List<User> users = userUtils.loadExistingUsers();

        for (User user : users) {
            if (userId == user.getUserId()) {
                user.setUserName(userName);
                user.setUserEmail(userEmail);
                user.setUserPassword(bCryptPasswordEncoder.encode(userPassword));
                break;
            } else {
                throw new RuntimeException("User doesn't exists");
            }
        }

        userUtils.saveUsers(users);
    }

    public void deleteUser(UUID userId) {
        List<User> users = userUtils.loadExistingUsers();

        users.removeIf(user -> user.getUserId().equals(userId));
        userUtils.saveUsers(users);
    }

}
