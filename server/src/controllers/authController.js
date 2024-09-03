const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, password, profile_picture } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  try {
    const existingUser = await pool.query(
      "SELECT * FROM Users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.sta;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const result = await pool.query(
      "INSERT INTO Users (name, email, password, profile_picture) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, profile_picture]
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respond with the new user data and token
    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      profile_picture: newUser.profile_picture,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and Password are required!" });
  }

  try {
    const userResult = await pool.query(
      "SELECT * FROM Users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Verify the password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send back the token and user data (excluding password)
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.body.id;

    const userResult = await pool.query(
      "SELECT id, name, email, profile_picture, created_at, updated_at FROM Users WHERE id = $1",
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = userResult.rows[0];
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, profile_picture, email, password } = req.body;

  if (!name && !profile_picture && !email && !password) {
    return res
      .status(400)
      .json({
        error:
          "At least one field (name, profile_picture, email, or password) must be provided to update.",
      });
  }

  try {
    // Dynamic query construction
    let updateFields = [];
    let updateValues = [];
    let index = 1;

    if (name) {
      updateFields.push(`name = $${index}`);
      updateValues.push(name);
      index++;
    }

    if (profile_picture) {
      updateFields.push(`profile_picture = $${index}`);
      updateValues.push(profile_picture);
      index++;
    }

    if (email) {
      // Validate email format (basic validation)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }

      // Check if the new email is already in use
      const emailCheck = await pool.query(
        "SELECT * FROM Users WHERE email = $1 AND id != $2",
        [email, userId]
      );
      if (emailCheck.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "Email already in use by another account." });
      }

      updateFields.push(`email = $${index}`);
      updateValues.push(email);
      index++;
    }

    if (password) {
      // Validate password strength (e.g., minimum 6 characters)
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long." });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      updateFields.push(`password = $${index}`);
      updateValues.push(hashedPassword);
      index++;
    }

    updateValues.push(userId); // Append user ID for the WHERE clause

    const query = `
      UPDATE Users 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${index}
      RETURNING id, name, email, profile_picture, created_at, updated_at;
    `;

    // Execute the update query
    const result = await pool.query(query, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = result.rows[0];

    // Respond with the updated user profile
    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
