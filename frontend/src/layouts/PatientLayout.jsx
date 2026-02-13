import { Outlet } from "react-router-dom";
import Sidebar from "./base/Sidebar";
import { patientNav } from './navigation/patientNav';

export default function PatientLayout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar navItems = {patientNav} />
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}