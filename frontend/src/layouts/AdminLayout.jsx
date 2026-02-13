import { Outlet } from "react-router-dom";
import Sidebar from "./base/Sidebar";
import { adminNav } from './navigation/adminNav';

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar navItems = {adminNav} />
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    )
}