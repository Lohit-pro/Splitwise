package org.splitrakam.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class Expense {

        private UUID expenseId;

        private UUID expenseGroupId;
        private String expenseDescription;
        private double expenseTotalAmount;
        private UUID expensePaidBy;
        private LocalDateTime expenseCreatedAt;
        private SplitType expenseSplitType; // EQUAL, EXACT, PERCENTAGE
        private List<Split> expenseSplits; // Who owes how much
        private boolean expenseIsSettled;

}
