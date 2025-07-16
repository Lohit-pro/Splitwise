package org.splitrakam.model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class Group {

    private UUID groupId;
    private String groupName;
    private String groupDescription;
    private UUID groupCreatedBy;
    private List<UUID> groupUsersIds;
    private List<UUID> groupExpenseIds;
    private LocalDateTime groupCreatedAt;

    public UUID getGroupId() {
        return groupId;
    }

    public void setGroupId(UUID groupId) {
        this.groupId = groupId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getGroupDescription() {
        return groupDescription;
    }

    public void setGroupDescription(String groupDescription) {
        this.groupDescription = groupDescription;
    }

    public UUID getGroupCreatedBy() {
        return groupCreatedBy;
    }

    public void setGroupCreatedBy(UUID groupCreatedBy) {
        this.groupCreatedBy = groupCreatedBy;
    }

    public List<UUID> getGroupUsersIds() {
        return groupUsersIds;
    }

    public void setGroupUsersIds(List<UUID> groupUsersIds) {
        this.groupUsersIds = groupUsersIds;
    }

    public List<UUID> getGroupExpenseIds() {
        return groupExpenseIds;
    }

    public void setGroupExpenseIds(List<UUID> groupExpenseIds) {
        this.groupExpenseIds = groupExpenseIds;
    }

    public LocalDateTime getGroupCreatedAt() {
        return groupCreatedAt;
    }

    public void setGroupCreatedAt(LocalDateTime groupCreatedAt) {
        this.groupCreatedAt = groupCreatedAt;
    }
}
