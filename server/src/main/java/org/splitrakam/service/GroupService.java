package org.splitrakam.service;

import org.splitrakam.model.Group;
import org.splitrakam.model.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class GroupService {

    public Group createGroup(String groupName, String groupDescription, UUID groupCreatedBy) {

    }

    public Group getGroupByGroupId(UUID groupId) {

    }

    public List<Group> getGroupsForUser(UUID userId) {

    }

    public void updateGroup(UUID groupId, String groupName, String groupDescription, UUID requesterUserId) {

    }

    public void deleteGroup(UUID groupId, UUID requesterUserId) {

    }

    public void addUserToGroup(UUID groupId, UUID userId, UUID requesterUserId) {

    }

    public void removeUserFromGroup(UUID groupId, UUID userId, UUID requesterUserId) {

    }

    public List<UUID> getGroupUsers(UUID groupId) {
        return null;
    }

    public List<UUID> getExpenseIdsForGroup(UUID groupId) {
        return null;
    }

}
