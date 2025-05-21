import React, { useEffect, useState } from "react";
import axios from "axios";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api/users",
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/");
      setUsers(res.data.users);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.email || (!editingUserId && !form.password)) {
      alert("Please fill all required fields");
      return;
    }

    try {
      if (editingUserId) {
        const updateData: any = { name: form.name, email: form.email };
        if (form.password.trim()) updateData.password = form.password;
        await api.put(`/${editingUserId}`, updateData);
        alert("User updated successfully");
        setEditingUserId(null);
      } else {
        await api.post("/", form);
        alert("User created successfully");
      }
      setForm({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUserId(user._id);
    setForm({ name: user.name, email: user.email, password: "" });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setForm({ name: "", email: "", password: "" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/${id}`);
      alert("User deleted");
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // --- New logout function ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    // Optionally reload or redirect to login page:
    window.location.reload();
    // Or: window.location.href = "/login";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 bg-white p-4 rounded shadow"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingUserId ? "Edit User" : "Add New User"}
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-3"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-3"
          required
        />
        <input
          type="password"
          name="password"
          placeholder={
            editingUserId ? "New Password (leave blank to keep)" : "Password"
          }
          value={form.password}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-3"
          {...(!editingUserId && { required: true })}
        />

        <div className="flex space-x-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingUserId ? "Update User" : "Create User"}
          </button>
          {editingUserId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 text-left">Name</th>
              <th className="border border-gray-300 p-2 text-left">Email</th>
              <th className="border border-gray-300 p-2 text-left">Role</th>
              <th className="border border-gray-300 p-2 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="border border-gray-300 p-2">{user.name}</td>
                  <td className="border border-gray-300 p-2">{user.email}</td>
                  <td className="border border-gray-300 p-2">{user.role}</td>
                  <td className="border border-gray-300 p-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
