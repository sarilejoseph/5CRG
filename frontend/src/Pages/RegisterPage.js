import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import bgLogin from "../Assets/bgregis.jpg";
import logo from "../Assets/logo.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Invalid email address");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Account Created");
      navigate("/homepage");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Email is already in use. Please log in instead.");
      } else {
        setErrorMessage("An error occurred. Please try again later.");
      }
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url(${bgLogin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-blue-600 bg-opacity-60"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="bg-gray-900 shadow-md px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} alt="logo" className="h-8 w-auto mr-2" />
            <div className="font-bold text-xl text-white">5thCRG E-LOGBOOK</div>
          </div>
          <nav className="flex space-x-6"></nav>
        </header>

        <div className="flex-grow flex items-center justify-center p-8">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="logo" className="h-24 w-24" />
            </div>
            <h1 className="text-3xl font-bold text-blue-800 mb-2">
              5thCRG E-LOGBOOK
            </h1>
            <p className="mb-8 text-gray-600">
              Civil Relations Operations System
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <div className="pl-3 pr-2">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    className="w-full p-3 rounded-md focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <div className="pl-3 pr-2">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="PASSWORD"
                    className="w-full p-3 rounded-md focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {password.length > 0 && (
                    <div
                      className="pr-3 cursor-pointer"
                      onClick={togglePasswordVisibility}
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {showPassword ? (
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        ) : (
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 00-2.79.588l.77.771A5.944 5.944 0 018 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0114.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"></path>
                        )}
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <div className="pl-3 pr-2">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="CONFIRM PASSWORD"
                    className="w-full p-3 rounded-md focus:outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword.length > 0 && (
                    <div
                      className="pr-3 cursor-pointer"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {showConfirmPassword ? (
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        ) : (
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 00-2.79.588l.77.771A5.944 5.944 0 018 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0114.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"></path>
                        )}
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded focus:outline-none"
              >
                Create Account
              </button>

              <div className="text-sm text-center mt-4">
                <span className="text-gray-600">Already have an account? </span>
                <Link to="/" className="text-blue-600 hover:text-blue-800">
                  Sign In
                </Link>
              </div>
            </form>
            {errorMessage && (
              <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
