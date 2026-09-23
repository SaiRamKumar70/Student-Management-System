import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api/students/";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  course: "",
  age: "",
};

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadStudents = async (query = "") => {
    setLoading(true);
    try {
      const url = query ? `${API}?search=${encodeURIComponent(query)}` : API;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Could not load students.");
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const payload = { ...form, age: Number(form.age) };
    const url = editingId ? `${API}${editingId}/` : API;
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const details = Object.values(data).flat().join(" ");
        throw new Error(details || "Request failed.");
      }

      setMessage(editingId ? "Student updated successfully." : "Student added successfully.");
      resetForm();
      loadStudents(search);
    } catch (err) {
      setError(err.message);
    }
  };

  const editStudent = (student) => {
    setEditingId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course,
      age: student.age,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      const response = await fetch(`${API}${id}/`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete student.");
      setMessage("Student deleted successfully.");
      loadStudents(search);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadStudents(search);
  };

  return (
    <div className="app">
      <header>
        <div>
          <h1>Student Management System</h1>
        </div>
      </header>

      <main>
        <section className="card form-card">
          <div className="section-title">
            <h2>{editingId ? "Edit Student" : "Add Student"}</h2>
            {editingId && <button className="secondary" onClick={resetForm}>Cancel</button>}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid">
              <label>
                Name
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>

              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </label>

              <label>
                Phone
                <input name="phone" value={form.phone} onChange={handleChange} />
              </label>

              <label>
                Course
                <input name="course" value={form.course} onChange={handleChange} required />
              </label>

              <label>
                Age
                <input name="age" type="number" min="10" max="100" value={form.age} onChange={handleChange} required />
              </label>
            </div>

            <button className="primary" type="submit">
              {editingId ? "Update Student" : "Add Student"}
            </button>
          </form>
        </section>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <section className="card">
          <div className="section-title">
            <h2>Students ({students.length})</h2>
            <form className="search" onSubmit={handleSearch}>
              <input
                placeholder="Search name, email or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="secondary" type="submit">Search</button>
            </form>
          </div>

          {loading ? (
            <p className="empty">Loading...</p>
          ) : students.length === 0 ? (
            <p className="empty">No students found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Course</th>
                    <th>Age</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.phone || "—"}</td>
                      <td>{student.course}</td>
                      <td>{student.age}</td>
                      <td className="actions">
                        <button className="edit" onClick={() => editStudent(student)}>Edit</button>
                        <button className="delete" onClick={() => deleteStudent(student.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
