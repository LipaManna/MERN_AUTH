import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
const EmailVerify = () => {
  axios.defaults.withCredentials = true;
  const { backendUrl, isLoggedin, userData, getUserData } =
    useContext(AppContext);
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const otp = inputRefs.current.map((input) => input.value).join("");
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-account`, {
        otp,
      });
      if (data.success) {
        toast.success("Email verified successfully");
        getUserData();
        navigate("/");
      }
      else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  useEffect(() => {
    isLoggedin && userData && userData.isVerified && navigate('/');
  }, [isLoggedin, userData]);

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        src={assets.logo}
        alt=""
        className="absolute top-5 left-5 w-28 sm:left-20 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <form className="p-8 rounded-lg bg-slate-900 shadow-lg w-96 text-sm" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-semibold text-white text-center mb-3">
          Email Verify OTP
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
          Verify
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
