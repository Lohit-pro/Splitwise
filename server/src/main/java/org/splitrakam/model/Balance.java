package org.splitrakam.model;

import java.util.UUID;

public class Balance {

    private UUID fromUserId;

    private UUID toUserId;
    private double amount; // fromUser owes toUser this amount

}
