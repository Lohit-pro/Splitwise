const pool = require("../config/db");

/**
 * Checks if a user is a member of a specific group.
 * @param {number} userId - The ID of the user to check.
 * @param {number} groupId - The ID of the group to check.
 * @returns {Promise<boolean>} - Returns true if the user is a member of the group, otherwise false.
 */
async function validateGroupMembership(userId, groupId) {
  try {
    const result = await pool.query(
      `SELECT * FROM Usergroups WHERE user_id = $1 AND group_id = $2`,
      [userId, groupId]
    );

    return result.rows.length > 0; // Returns true if the user is a member, otherwise false
  } catch (err) {
    console.error("Error validating group membership:", err);
    throw new Error(
      "Unable to validate group membership due to a server error."
    );
  }
}

/**
 * Retrieves details about a group, such as its members, name, and description.
 * @param {number} groupId - The ID of the group to retrieve details for.
 * @returns {Promise<Object>} - Returns an object containing group details.
 */
async function getGroupDetails(groupId) {
  try {
    // Retrieve basic group information
    const groupResult = await pool.query(
      `SELECT id, name, description FROM Groups WHERE id = $1`,
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      throw new Error("Group not found.");
    }

    const group = groupResult.rows[0];

    // Retrieve group members
    const membersResult = await pool.query(
      `SELECT Users.id, Users.name, Users.email FROM Users 
       INNER JOIN GroupMembers ON Users.id = GroupMembers.user_id
       WHERE GroupMembers.group_id = $1`,
      [groupId]
    );

    const members = membersResult.rows;

    // Combine group information with its members
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      members: members,
    };
  } catch (err) {
    console.error("Error retrieving group details:", err);
    throw new Error("Unable to retrieve group details due to a server error.");
  }
}

module.exports = {
  validateGroupMembership,
  getGroupDetails,
};
