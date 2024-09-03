const pool = require("../config/db");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
require("dotenv").config();

// Create New Group
exports.createGroup = async (req, res) => {
  const { name, members } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: "Group name is required" });
  }

  try {
    await pool.query("BEGIN");

    const groupResult = await pool.query(
      "INSERT INTO Groups (name, created_by) VALUES ($1, $2) RETURNING *",
      [name, userId]
    );

    const newGroup = groupResult.rows[0];

    await pool.query(
      "INSERT INTO UserGroups (user_id, group_id) VALUES ($1, $2)",
      [userId, newGroup.id]
    );

    // Optionally, add additional members if provided
    if (members && members.length > 0) {
      const memberInsertQueries = members.map((memberId) => {
        return pool.query(
          "INSERT INTO UserGroups (user_id, group_id) VALUES ($1, $2)",
          [memberId, newGroup.id]
        );
      });

      await Promise.all(memberInsertQueries);
    }

    await pool.query("COMMIT");

    res.status(201).json({
      id: newGroup.id,
      name: newGroup.name,
      created_by: newGroup.created_by,
      message: "Group created successfully",
    });
  } catch (err) {
    // Rollback the transaction in case of error
    await pool.query("ROLLBACK");

    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get All Groups
exports.getAllGroups = async (req, res) => {
  const userId = req.user.id;

  try {
    // Query to fetch all groups that the authenticated user is a member of
    const groupsResult = await pool.query(
      `SELECT g.id, g.name, g.created_by, g.created_at
       FROM Groups g
       INNER JOIN UserGroups ug ON g.id = ug.group_id
       WHERE ug.user_id = $1`,
      [userId]
    );

    const groups = groupsResult.rows;

    res.status(200).json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get Group Details
exports.getGroupDetails = async (req, res) => {
  const groupId = req.params.groupId; // Assume the group ID is passed as a URL parameter

  try {
    // Query to get group details
    const groupResult = await pool.query(`SELECT * FROM Groups WHERE id = $1`, [
      groupId,
    ]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const group = groupResult.rows[0];

    // Query to get all members of the group
    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.profile_picture 
       FROM Users u
       INNER JOIN UserGroups ug ON u.id = ug.user_id
       WHERE ug.group_id = $1`,
      [groupId]
    );

    const members = membersResult.rows;

    // Query to get all expenses of the group
    const expensesResult = await pool.query(
      `SELECT * FROM Expenses WHERE group_id = $1`,
      [groupId]
    );

    const expenses = expensesResult.rows;

    res.status(200).json({
      group,
      members,
      expenses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update Group Details
exports.updateGroupDetails = async (req, res) => {
  const groupId = req.params.groupId; // Assume the group ID is passed as a URL parameter
  const { name } = req.body;

  try {
    // Basic validation
    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Update the group name
    const updateResult = await pool.query(
      `UPDATE Groups SET name = $1 WHERE id = $2 RETURNING *`,
      [name, groupId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    res
      .status(200)
      .json({
        message: "Group updated successfully",
        group: updateResult.rows[0],
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete Group
exports.deleteGroup = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const deleteResult = await pool.query(
      `DELETE FROM Groups WHERE id = $1 RETURNING *`,
      [groupId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// // Add Expense
// exports.addNewExpense = async (req, res) => {
//   const groupId = req.params.groupId;
//   const { description, amount, paid_by, split_type } = req.body;

//   try {
//     // Basic validation
//     if (!description || !amount || !paid_by || !split_type) {
//       return res
//         .status(400)
//         .json({ error: "All expense details are required" });
//     }

//     // Insert the expense into the database
//     const expenseResult = await pool.query(
//       `INSERT INTO Expenses (group_id, description, amount, paid_by, split_type) 
//        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//       [groupId, description, amount, paid_by, split_type]
//     );

//     res
//       .status(201)
//       .json({
//         message: "Expense added successfully",
//         expense: expenseResult.rows[0],
//       });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Get All Expenses
// exports.getAllExpenses = async (req, res) => {
//   const groupId = req.params.groupId;

//   try {
//     // Query to get all expenses of the group
//     const expensesResult = await pool.query(
//       `SELECT * FROM Expenses WHERE group_id = $1`,
//       [groupId]
//     );

//     res.status(200).json(expensesResult.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Delete an Expense
// exports.deleteExpense = async (req, res) => {
//   const expenseId = req.params.expenseId;

//   try {
//     // Delete the expense
//     const deleteResult = await pool.query(
//       `DELETE FROM Expenses WHERE id = $1 RETURNING *`,
//       [expenseId]
//     );

//     if (deleteResult.rows.length === 0) {
//       return res.status(404).json({ error: "Expense not found" });
//     }

//     res.status(200).json({ message: "Expense deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };
