import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import bgLogin from "../Assets/bgregis.jpg";
import logo from "../Assets/logo.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login Successful");
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      if (err.code === "auth/user-not-found") {
        setErrorMessage(
          "The account with this email doesn't exist. Please sign up first."
        );
      } else {
        setErrorMessage("An error occurred. Please try again later.");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                    placeholder="EMAIL OR CLIENT NUMBER"
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
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {showPassword ? (
                          <path
                            fillRule="evenodd"
                            d="M12 4.5c-5 0-9 5.5-9 5.5s4 5.5 9 5.5 9-5.5 9-5.5-4-5.5-9-5.5zm0 2c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                            clipRule="evenodd"
                          />
                        ) : (
                          <path
                            fillRule="evenodd"
                            d="M12 4.5c-5 0-9 5.5-9 5.5s4 5.5 9 5.5 9-5.5 9-5.5-4-5.5-9-5.5zm0 2c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM2.83 2.83l18.34 18.34-1.42 1.42L1.41 4.25 2.83 2.83z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded focus:outline-none"
              >
                Sign In
              </button>
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

export default LoginPage;
