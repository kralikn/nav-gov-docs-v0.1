import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({children}) {

  return (
    <div className="grid lg:grid-cols-5 md:grid-cols-1">
      <div className="hidden lg:block lg:col-span-1 lg:min-h-screen">
        <Sidebar />
      </div>
      <div className="lg:col-span-4">
        <Navbar />
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
