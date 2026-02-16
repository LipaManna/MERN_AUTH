import { useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const {backendUrl, setIsLoggedin, getUserData} = useContext(AppContext)
  const [state, setState] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if(state === 'signup'){
          const {data} = await axios.post(backendUrl + '/api/auth/register', {name, email, password});
          axios.defaults.withCredentials = true;
          if(data.success){
            setIsLoggedin(true);
            getUserData();
            navigate('/');
          }
          else{
            toast.error(data.message);
          }
        }
        else{
          const {data} = await axios.post(backendUrl + '/api/auth/login', {email, password});
          axios.defaults.withCredentials = true;
          if(data.success){
            setIsLoggedin(true);
            getUserData();
            navigate('/');
          }
          else{
            toast.error(data.message);
          }
        }
    } catch (error) {
        toast.error(error.response.data.message);
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        src={assets.logo}
        alt=""
        className="absolute top-5 left-5 w-28 sm:left-20 sm:w-32 cursor-pointer"
        onClick={() => navigate('/')}
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "login" ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-sm text-center mb-6">
          {state === "login"
            ? "Login to your account"
            : "Register to create an account"}
        </p>
        <form onSubmit={handleSubmit}>
          {state === "signup" && (
            <div className="flex items-center mb-4 w-full gap-3 px-5 py-2.5 rounded-full bg-[#333a5C]">
              <img src={assets.person_icon} alt="" />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="bg-transparent outline-none text-white font-light"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
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
          <div className="flex items-center mb-4 w-full gap-3 px-5 py-2.5 rounded-full bg-[#333a5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              required
              className="bg-transparent outline-none text-white font-light"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {state === "login" && (
            <p className=" text-indigo-500 mb-4 cursor-pointer" onClick={() => navigate('/reset-password')}>
              Forgot password?
            </p>
          )}
          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white transition-all cursor-pointer font-medium"
          >
            {state === "login" ? "Login" : "Sign Up"}
          </button>
        </form>
        {state === "signup" ? (
          <p className="text-center mt-4 text-gray-400 text-xs">
            Already have an account?{" "}
            <span
              className="cursor-pointer text-blue-400 underline"
              onClick={() => setState("login")}
            >
              {" "}
              Login here
            </span>
          </p>
        ) : (
          <p className="text-center mt-4 text-gray-400 text-xs">
            Don't have an account?{" "}
            <span
              className="cursor-pointer text-blue-400 underline"
              onClick={() => setState("signup")}
            >
              {" "}
              Sign up here
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
