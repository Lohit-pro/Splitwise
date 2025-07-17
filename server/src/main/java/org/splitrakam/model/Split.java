package org.splitrakam.model;

import java.util.UUID;

public class Split {

    private UUID splitUserId;

    private double splitAmountOwed; // Based on split type
    private Double splitPercentage; // Used only if splitType == PERCENTAGE

}

