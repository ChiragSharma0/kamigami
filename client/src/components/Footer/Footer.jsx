import React from "react";

import "./Module.css"

// ─── Edit your links here ───────────────────────────────────────────
const LINKS = {
  connectWithUs: [
    { label: "Call", href: "#" },
    { label: "Text (WhatsApp)", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
  orderSupport: [
    { label: "Make a return/Exchange", href: "#" },
    { label: "Refund/Exchange policy", href: "#" },
    { label: "Track your order", href: "#" },
    { label: "Shipping policy", href: "#" },
    { label: "FAQ's", href: "#" },
    { label: "Terms", href: "#" },
  ],
  weAreKAMIGAMI: [
    { label: "Our story", href: "#" },
    { label: "Walk-in Stores", href: "#" },
    { label: "Collaborations", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Media", href: "#" },
    { label: "Blogs", href: "#" },
  ],
};
// ────────────────────────────────────────────────────────────────────

function LinkColumn({ title, links }) {
  return (
    <div className="footer-col">
      <h4>{title}</h4>
      <ul>
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function KamigamiFooter() {
  return (
    <>
      <footer className="footer-root">

        {/* Top bar */}
        

        {/* Links grid */}
        <div className="footer-links-grid">
          <LinkColumn title="Connect with us" links={LINKS.connectWithUs} />
          <LinkColumn title="Order Support" links={LINKS.orderSupport} />
          <LinkColumn title="We are KAMIGAMI" links={LINKS.weAreKAMIGAMI} />
        </div>

        {/* Faded divider */}
        <div className="faded-divider" />

        {/* Giant brand name */}
        <div className="footer-brand-bar">
          <span className="brand-text">KAMIGAMI</span>
        </div>

        <div className="footer-bottom-note">
          © 2025 KAMIGAMI. ALL RIGHTS RESERVED.
        </div>

      </footer>
    </>
  );
}