import "../assets/CSS/Register.css";
import { useEffect, useRef, useState } from "react";

const Register = () => {
  const [step, setStep] = useState("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phnNumber, setPhnNumber] = useState("");
  const [tehsil, setTehsil] = useState("");
  const [district, setDistrict] = useState("");
  const [pass, setPass] = useState("");
  const [address, setAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const otpRef = useRef(null);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!seconds) return undefined;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const submitDetails = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (pass.length < 8) return setError("Your password must contain at least 8 characters.");
    if (!/^\d{10}$/.test(phnNumber)) return setError("Enter a valid 10-digit Indian mobile number.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");

    setBusy(true);
    try {
      const response = await fetch("/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: name,
          Email: email,
          Phone: phnNumber,
          Address: `${address}, ${tehsil}, ${district}`,
          Password: pass,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send verification code.");
      setStep("otp");
      setSeconds(60);
      setMessage(`We sent a 6-digit verification code to ${email.trim().toLowerCase()}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verifyEmail = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit OTP sent to your email.");
    setBusy(true);
    try {
      const response = await fetch("/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, OTP: otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to verify the OTP.");
      setMessage("Email verified successfully. Your account is ready.");
      setTimeout(() => { window.location.href = "/auth/login"; }, 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    if (seconds > 0 || busy) return;
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: name, Email: email, Phone: phnNumber, Address: `${address}, ${tehsil}, ${district}`, Password: pass }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to resend the code.");
      setSeconds(60);
      setOtp("");
      setMessage("A new verification code has been sent.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="RegForm">
      <div className="RegHeader">
        <div className="RegEyebrow">SURAKSHA SETU</div>
        <div className="RegTitle">Create your account</div>
        <p className="RegSubtitle">Join the disaster response community and stay connected to emergency information.</p>
      </div>

      <div className="RegProgress" aria-label="Registration progress">
        <div className={step === "details" ? "RegProgressStep active" : "RegProgressStep complete"}><span>1</span><b>Your details</b></div>
        <div className="RegProgressLine" />
        <div className={step === "otp" ? "RegProgressStep active" : "RegProgressStep"}><span>2</span><b>Verify email</b></div>
      </div>

      {error && <div className="RegAlert error" role="alert">⚠ {error}</div>}
      {message && <div className="RegAlert success" role="status">✓ {message}</div>}

      {step === "details" ? (
        <form onSubmit={submitDetails}>
          <div className="RegGrid">
            <label className="RegField"><span>Full name</span><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Keshav Agrawal" autoComplete="name" /></label>
            <label className="RegField"><span>Email address</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /><small>We'll send a verification code here.</small></label>
            <label className="RegField"><span>Mobile number</span><div className="PhoneInput"><span>+91</span><input required inputMode="numeric" maxLength="10" value={phnNumber} onChange={(e) => setPhnNumber(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" autoComplete="tel" /></div></label>
            <label className="RegField"><span>Tehsil / Taluk</span><input required value={tehsil} onChange={(e) => setTehsil(e.target.value)} placeholder="Enter your tehsil / taluk" /></label>
            <label className="RegField"><span>District</span><input required value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Enter your district" /></label>
            <label className="RegField full"><span>Address</span><input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House / street / locality" autoComplete="street-address" /></label>
            <label className="RegField full"><span>Password</span><input required type="password" minLength="8" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" /><small>Your password is securely hashed before storage.</small></label>
          </div>
          <button className="RegPrimaryButton" type="submit" disabled={busy}>{busy ? "Sending verification code…" : "Continue to email verification →"}</button>
        </form>
      ) : (
        <form onSubmit={verifyEmail} className="OtpPanel">
          <div className="OtpIcon">✉</div>
          <h3>Check your inbox</h3>
          <p>Enter the 6-digit code we sent to <strong>{email.trim().toLowerCase()}</strong>.</p>
          <input ref={otpRef} className="OtpInput" inputMode="numeric" autoComplete="one-time-code" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="000000" aria-label="Email verification code" />
          <button className="RegPrimaryButton" type="submit" disabled={busy}>{busy ? "Verifying…" : "Verify email & create account"}</button>
          <div className="OtpActions">
            <button type="button" className="RegTextButton" onClick={() => { setStep("details"); setError(""); setMessage(""); }}>← Edit details</button>
            <button type="button" className="RegTextButton" onClick={resendOtp} disabled={seconds > 0 || busy}>{seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}</button>
          </div>
          <div className="OtpHint">The code expires after 10 minutes. Never share your OTP with anyone.</div>
        </form>
      )}
    </div>
  );
};

export default Register;
