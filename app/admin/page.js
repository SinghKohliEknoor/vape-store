// app/admin/page.js
export default function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p>Only visible to users whose role === "admin"</p>
      {/* …your admin widgets… */}
    </div>
  );
}
