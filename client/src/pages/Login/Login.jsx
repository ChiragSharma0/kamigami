import React from "react";
import "./module.css";

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <h1 className="logo-text">KAMIGAMI</h1>

        {/* Title */}
        <h2 className="login-title">Sign in</h2>

        <p className="login-subtext">Sign in or create an account</p>

        {/* Google Button */}
        <button className="google-btn">Continue with Google</button>

        {/* Divider */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* Phone Input */}
        <input type="tel" placeholder="Phone number" className="phone-input" />

        {/* Continue Button */}
        <button className="continue-btn">Continue</button>

        {/* Terms */}
        <p className="terms-text">
          By continuing, you agree to our <span>Terms of service</span>
        </p>
      </div>

      {/* Footer */}
      <p className="privacy-text">Privacy policy</p>
    </div>
  );
};

export default Login;
