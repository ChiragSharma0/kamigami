import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  History,
  MapPin,
  CreditCard,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Pencil,
} from "lucide-react";
import "./module.css";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: ShoppingBag, label: "My Orders" },
  { icon: History, label: "Order History" },
  { icon: MapPin, label: "Saved Addresses" },
  { icon: CreditCard, label: "Payment Methods" },
  { icon: Shield, label: "Security" },
  { icon: Bell, label: "Notifications" },
  { icon: HelpCircle, label: "Help Center" },
  { icon: LogOut, label: "Logout", danger: true },
];

const AccountSidebar = () => {
  const [active, setActive] = useState("Dashboard");

  return (
    <aside className="account-sidebar">
      {/* Profile Card */}
      <div className="sidebar-profile-card">
        <div className="sidebar-avatar-ring">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kamigami&backgroundColor=c0aede"
            alt="User Avatar"
            className="sidebar-avatar"
          />
        </div>
        <h3 className="sidebar-user-name">Rahul Sharma</h3>
        <p className="sidebar-user-email">rahul.sharma@email.com</p>
        <p className="sidebar-user-phone">+91 98765 43210</p>
        <button className="sidebar-edit-btn">
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`sidebar-nav-item ${active === item.label ? "active" : ""} ${item.danger ? "danger" : ""}`}
            onClick={() => setActive(item.label)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AccountSidebar;
