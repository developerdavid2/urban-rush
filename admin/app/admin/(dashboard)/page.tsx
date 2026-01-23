// app/admin/(dashboard)/page.tsx
export default function AdminDashboardPage() {
  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-admin-surface p-6 rounded-lg shadow">
          <h3 className="font-semibold">Total Users</h3>
          <p className="text-3xl font-bold mt-2">1,234</p>
        </div>
        <div className="bg-admin-surface p-6 rounded-lg shadow">
          <h3 className="font-semibold">Orders</h3>
          <p className="text-3xl font-bold mt-2">567</p>
        </div>
        <div className="bg-admin-surface p-6 rounded-lg shadow">
          <h3 className="font-semibold">Revenue</h3>
          <p className="text-3xl font-bold mt-2">$12,345</p>
        </div>
      </div>
    </div>
  );
}
