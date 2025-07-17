package org.splitrakam.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Settlement {

    private UUID settlementId;

    private UUID settlementGroupId;
    private UUID settlementFromUserId;
    private UUID settlementToUserId;
    private double settlementAmount;
    private String settlementDescription;
    private LocalDateTime settlementCreatedAt;

}

