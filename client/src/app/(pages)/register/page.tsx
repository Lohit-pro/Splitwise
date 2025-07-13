"use client";

import { useState } from "react";
import Link from "next/link";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error message
    setSuccess(""); // Reset success message

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Registration successful! You can now login.");
        // Clear form fields
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred while registering.");
    }
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit">Register</button>
      </form>

      <p>Already have an account?</p>
      <Link href="/login">
        <button>Login</button>
      </Link>

      <style jsx>{`
        .register-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 20px;
          color: red;
        }
        form {
          display: flex;
          flex-direction: column;
        }
        label {
          margin-top: 10px;
        }
        button {
          margin-top: 20px;
        }
        .error {
          color: red;
          margin-top: 10px;
        }
        .success {
          color: green;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
