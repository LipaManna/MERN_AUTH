import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState(0);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const inputRefs = useRef([]);
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value.length === 0 && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    if (paste.length === 6) {
      for (let i = 0; i < paste.length; i++) {
        inputRefs.current[i].value = paste[i];
      }
    }
  };

  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true;

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        { email },
      );
      if (data.success) {
        setIsEmailSent(true);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((e) => e.value);
    setOtp(otpArray.join(""));
    setIsOtpVerified(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        { email, otp, newPassword },
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        src={assets.logo}
        alt=""
        className="absolute top-5 left-5 w-28 sm:left-20 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />
      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
          className="p-8 rounded-lg bg-slate-900 shadow-lg w-96 text-sm"
        >
          <h1 className="text-2xl font-semibold text-white text-center mb-3">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-gray-400 text-xs">
            Enter your registered email address to reset your password
          </p>
          <div className="flex items-center mb-4 w-full gap-3 px-5 py-2.5 rounded-full bg-[#333a5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              placeholder="Email"
              required
              className="bg-transparent outline-none text-white font-light"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white transition-all cursor-pointer font-medium"
          >
            Submit
          </button>
        </form>
      )}
      {!isOtpVerified && isEmailSent && (
        <form
          onSubmit={onSubmitOtp}
          className="p-8 rounded-lg bg-slate-900 shadow-lg w-96 text-sm"
        >
          <h1 className="text-2xl font-semibold text-white text-center mb-3">
            Reset Password OTP
          </h1>
          <p className="text-center mb-6 text-gray-400 text-xs">
            Enter 6-digit OTP sent to your email
          </p>
          <div className="flex justify-between mb-8">
            {Array.from({ length: 6 }, (_, i) => (
              <input
                key={i}
                type="text"
                className="w-12 h-12 bg-[#333A5C] text-xl text-center text-white font-light rounded-md"
                maxLength="1"
                required
                ref={(el) => (inputRefs.current[i] = el)}
                onInput={(e) => handleInput(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white transition-all cursor-pointer font-medium"
          >
            Submit
          </button>
        </form>
      )}
      {isOtpVerified && isEmailSent && (
        <form
          onSubmit={onSubmitNewPassword}
          className="p-8 rounded-lg bg-slate-900 shadow-lg w-96 text-sm"
        >
          <h1 className="text-2xl font-semibold text-white text-center mb-3">
            New Password
          </h1>
          <p className="text-center mb-6 text-gray-400 text-xs">
            Enter your new password
          </p>
          <div className="flex items-center mb-4 w-full gap-3 px-5 py-2.5 rounded-full bg-[#333a5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              required
              className="bg-transparent outline-none text-white font-light"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white transition-all cursor-pointer font-medium"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
