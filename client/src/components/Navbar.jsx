import { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, isLoggedin, setUserData, setIsLoggedin } =
    useContext(AppContext);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const {data} = await axios.post(`${backendUrl}/api/auth/send-verify-otp`);
      if (data.success) {
        toast.success("Verification OTP sent successfully");
        navigate('/email-verify');
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const {data} = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setIsLoggedin(false);
        navigate("/");
        setUserData(null);
        toast.success("Logged out successfully");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }
  return (
    <div className="navbar w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} alt="logo" className="w-28 sm:w-32" />
      {userData ? (
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center relative group">
          {userData.name && userData.name[0].toUpperCase()}
          <div className="absolute top-0 right-0 z-10 text-black rounded pt-10 hidden group-hover:block">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {!userData?.isVerified && (
                <li className="cursor-pointer hover:bg-gray-200 px-2 py-1 pr-10" onClick={sendVerificationOtp}>
                  Verify email
                </li>
              )}
              <li className="cursor-pointer hover:bg-gray-200 px-2 py-1 pr-10" onClick={handleLogout}>
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Login <img src={assets.arrow_icon} alt="" />{" "}
        </button>
      )}
    </div>
  );
};

export default Navbar;
