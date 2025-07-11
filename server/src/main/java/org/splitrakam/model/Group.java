package org.splitrakam.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class Group {

    private UUID groupId;

    private String groupName;
    private String groupDescription;
    private UUID groupCreatedBy;
    private List<UUID> groupMembersIds;
    private List<UUID> groupExpenseIds;
    private LocalDateTime groupCreatedAt;

}
