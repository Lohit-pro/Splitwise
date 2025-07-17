package org.splitrakam.service;

import org.splitrakam.model.Group;
import org.splitrakam.utils.GroupUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class GroupService {

    @Autowired
    GroupUtils groupUtils;

    public Group createGroup(String groupName, String groupDescription, UUID groupCreatedBy) {
        List<Group> groups = groupUtils.loadExistingGroups();

        Group newGroup = new Group();
        newGroup.setGroupId(UUID.randomUUID());
        newGroup.setGroupName(groupName);
        newGroup.setGroupDescription(groupDescription);
        newGroup.setGroupCreatedBy(groupCreatedBy);
        newGroup.setGroupUsersIds(new ArrayList<>());
        newGroup.setGroupExpenseIds(new ArrayList<>());
        newGroup.setGroupCreatedAt(LocalDateTime.now());

        groups.add(newGroup);
        groupUtils.saveGroup(groups);

        return newGroup;
    }

    public Optional<Group> getGroupByGroupId(UUID groupId) {
        List<Group> groups = groupUtils.loadExistingGroups();

        for (Group group : groups) {
            if (groupId == group.getGroupId()) {
                return Optional.of(group);
            }
        }

        return Optional.empty();
    }

    public List<Group> getGroupsForUser(UUID userId) {
        List<Group> groups = groupUtils.loadExistingGroups();
        List<Group> groupsOfUser = new ArrayList<>();

        //TODO simplify logic using stream
        for (Group group : groups) {
            if (group.getGroupUsersIds().contains(userId)) {
                groupsOfUser.add(group);
            }
        }

        return groupsOfUser;
    }

    public void updateGroup(UUID groupId, String groupName, String groupDescription, UUID requesterUserId) {
        List<Group> groups = groupUtils.loadExistingGroups();

        for (Group group : groups) {
            if (group.getGroupId().equals(groupId)) {
                if (group.getGroupCreatedBy().equals(requesterUserId)) {
                    group.setGroupName(groupName);
                    group.setGroupDescription(groupDescription);
                    break;
                } else {
                    throw new RuntimeException("Only admin can update the group");
                }
            }
        }

        groupUtils.saveGroup(groups);
    }

    public void deleteGroup(UUID groupId, UUID requesterUserId) {
        List<Group> groups = groupUtils.loadExistingGroups();

        for (Group group : groups) {
            if (group.getGroupId().equals(groupId)) {
                if (group.getGroupCreatedBy().equals(requesterUserId)) {
                    groups.remove(group);
                    break;
                } else
                    throw new RuntimeException("Only admin can delete the group");
            }
        }

        groupUtils.saveGroup(groups);
    }

    public void addUserToGroup(UUID groupId, UUID userId, UUID requesterUserId) {
        List<Group> groups = groupUtils.loadExistingGroups();
        boolean updated = false;

        for (Group group : groups) {
            if (groupId.equals(group.getGroupId())) {
                if (!group.getGroupCreatedBy().equals(requesterUserId)) {
                    throw new RuntimeException("Only admin can add a new member to the group");
                }

                if (!group.getGroupUsersIds().contains(userId)) {
                    group.getGroupUsersIds().add(userId);
                    updated = true;
                }

                break;
            }
        }

        if (updated) {
            groupUtils.saveGroup(groups);
        } else {
            throw new RuntimeException("Group not found or user already exists");
        }
    }

    public void removeUserFromGroup(UUID groupId, UUID userId, UUID requesterUserId) {
        List<Group> groups = groupUtils.loadExistingGroups();

        for (Group group : groups) {
            if (groupId.equals(group.getGroupId())) {

                if (!requesterUserId.equals(group.getGroupCreatedBy())) {
                    throw new RuntimeException("Only admin can remove user from group");
                }

                group.getGroupUsersIds().removeIf(uId -> uId.equals(userId));
                break;
            }
        }

        groupUtils.saveGroup(groups);
    }

    public List<UUID> getGroupUsers(UUID groupId) {
        List<Group> groups = groupUtils.loadExistingGroups();

        for (Group group : groups) {
            if (group.getGroupId().equals(groupId)) {
                return group.getGroupUsersIds();
            }
        }

        return new ArrayList<>();
    }

    public List<UUID> getExpenseIdsForGroup(UUID groupId) {
        List<Group> groups = groupUtils.loadExistingGroups();

        for (Group group : groups) {
            if (group.getGroupId().equals(groupId)) {
                return group.getGroupExpenseIds();
            }
        }

        return new ArrayList<>();
    }

}
