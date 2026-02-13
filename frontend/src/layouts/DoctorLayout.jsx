import { Outlet } from "react-router-dom";
import Sidebar from "./base/Sidebar";
import { doctorNav } from './navigation/doctorNav';

export default function DoctorLayout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar navItems={doctorNav} />
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}