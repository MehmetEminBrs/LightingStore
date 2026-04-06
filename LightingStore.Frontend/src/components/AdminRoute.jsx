import { Navigate } from "react-router-dom";

const getRoleFromToken = (tkn) => {
  if (!tkn) return null;
  try {
    const p = JSON.parse(atob(tkn.split(".")[1]));
    return (
      p["role"] ||
      p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      p["roleId"] ||
      null
    );
  } catch {
    return null;
  }
};

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = getRoleFromToken(token);

  if (!token) return <Navigate to="/login" />;
  if (role !== "Admin" && role !== "admin") return <Navigate to="/" />;

  return children;
}