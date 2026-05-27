import React, { useEffect } from "react";
import PageMeta from "../../components/PageMeta";
import {
  ShoppingBag,
  Package,
  Heart,
  MapPin,
  User,
  Phone,
  Mail,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

import AccountSidebar from "../../components/AccountSidebar/AccountSidebar";
import StatCard from "../../components/StatCard/StatCard";
import AddressCard from "../../components/AddressCard/AddressCard";
import OrderCard from "../../components/OrderCard/OrderCard";

import "./module.css";

/* ── Dummy Data ── */

const stats = [
  { icon: ShoppingBag, label: "Total Orders", value: "24" },
  { icon: Package, label: "Active Orders", value: "3" },
  { icon: Heart, label: "Wishlist", value: "12" },
  { icon: MapPin, label: "Saved Addresses", value: "2" },
];

const addresses = [
  {
    label: "Home Address",
    address:
      "Flat 402, Tower B, Prestige Heights, Sector 45, Gurgaon, Haryana 122003",
    isDefault: true,
  },
  {
    label: "Work Address",
    address:
      "3rd Floor, WeWork Galaxy, 43 Residency Road, Ashok Nagar, Bangalore 560025",
    isDefault: false,
  },
];

const orders = [
  {
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop",
    name: "Kamigami Oversized Hoodie — Black",
    status: "Delivered",
    date: "March 10, 2026",
    price: "3,499",
  },
  {
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200&h=200&fit=crop",
    name: "Kamigami Graphic Tee — Dragon",
    status: "Shipping",
    date: "March 13, 2026",
    price: "1,899",
  },
];

/* ── Page Component ── */

const AccountDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-up");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-page">
      <PageMeta 
        title="My Account" 
        description="Access and manage your personal Kamigami customer dashboard. View and track active orders, update your saved addresses, customize your profile, and more." 
      />
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <AccountSidebar />

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Section Title */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">My Account</h1>
            <p className="dashboard-subtitle">
              Manage your profile, orders, and preferences
            </p>
          </div>

          {/* Section 1 — Account Overview */}
          <section className="dashboard-section">
            <h2 className="section-title">Account Overview</h2>
            <div className="stats-grid">
              {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>
          </section>

          {/* Section 2 — Personal Details */}
          <section className="dashboard-section">
            <h2 className="section-title">Personal Details</h2>
            <div className="details-card">
              <div className="detail-fields">
                <div className="detail-field">
                  <label>
                    <User size={14} />
                    Full Name
                  </label>
                  <input type="text" defaultValue={user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Set your name'} />
                </div>
                <div className="detail-field">
                  <label>
                    <Phone size={14} />
                    Phone Number
                  </label>
                  <input type="text" defaultValue={user.phone || "No phone added"} />
                </div>
                <div className="detail-field">
                  <label>
                    <Mail size={14} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                  />
                </div>
              </div>
              <button className="update-profile-btn">Update Profile</button>
            </div>
          </section>

          {/* Section 3 — Saved Addresses */}
          <section className="dashboard-section">
            <h2 className="section-title">Saved Addresses</h2>
            <div className="addresses-grid">
              {addresses.map((addr, i) => (
                <AddressCard key={i} {...addr} />
              ))}
            </div>
          </section>

          {/* Section 4 — Recent Orders */}
          <section className="dashboard-section">
            <h2 className="section-title">Recent Orders</h2>
            <div className="orders-list">
              {orders.map((order, i) => (
                <OrderCard key={i} {...order} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AccountDashboard;

