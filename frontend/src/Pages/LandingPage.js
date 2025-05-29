import React, { useEffect } from "react";
import { motion } from "framer-motion";
import bgLogin from "../Assets/bgmain.png";
import logo from "../Assets/logo.png";
import { Link } from "react-router-dom";
import { FaFacebook, FaYoutube, FaInstagram, FaTwitter } from "react-icons/fa";

const LandingPage = () => {
  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        duration: 0.8,
      },
    },
  };

  const buttonVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 1.2,
      },
    },
    hover: {
      scale: 1.05,
      backgroundColor: "#e53e3e",
      transition: { type: "spring", stiffness: 400 },
    },
  };

  const footerVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 1.5,
        duration: 0.5,
      },
    },
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
      <div className="relative z-10 flex flex-col min-h-screen">
        <motion.header
          className="bg-gray-900 shadow-md px-8 py-4 flex justify-between items-center"
          initial="hidden"
          animate="visible"
          variants={headerVariants}
        >
          <div className="flex items-center">
            <img src={logo} alt="logo" className="h-8 w-auto mr-2" />
            <div className="font-bold text-xl text-white">
              5th Civil Relations Group AFP
            </div>
          </div>
        </motion.header>

        <motion.div
          className="flex-grow flex flex-col items-center justify-center p-8 text-center"
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <motion.p
            className="text-white text-5xl font-bold mb-4 shadow-text"
            variants={itemVariants}
          >
            5th Civil Relations Group CRSAFP
          </motion.p>

          <motion.p
            className="italic text-lg text-white max-w-lg mb-4 shadow-text"
            variants={itemVariants}
          >
            "Strength in unity, service with integrity—5th CRG, CRSAFP,
            committed to truth, duty, and country."
          </motion.p>

          <motion.p
            className="text-white text-3xl font-semibold mb-8 shadow-text"
            variants={itemVariants}
          >
            Gawa na laging may puso
          </motion.p>

          <motion.div className="mb-6" variants={logoVariants}>
            <img src={logo} alt="logo" className="h-64 w-64" />
          </motion.div>

          <Link to="/login">
            <motion.button
              className="bg-red-600 w-[300px] h-[60px] text-2xl font-bold text-white py-3 px-8 rounded transition-colors"
              onClick={() => console.log("Login button clicked")}
              variants={buttonVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </Link>
        </motion.div>

        <motion.footer
          className="bg-gray-900 text-gray-300 text-sm py-4 mt-auto shadow-inner"
          initial="hidden"
          animate="visible"
          variants={footerVariants}
        >
          <div className="container mx-auto px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left font-medium">
              © {new Date().getFullYear()} 5th Civil Relations Group AFP. All
              Rights Reserved.
            </div>
            <div className="flex space-x-6">
              <a
                href="https://www.facebook.com/5thcrg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://www.youtube.com/@5crgcrsafp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="YouTube"
              >
                <FaYoutube size={24} />
              </a>
              <a
                href="https://www.instagram.com/5thcrg?fbclid=IwY2xjawKYxSlleHRuA2FlbQIxMABicmlkETFvc1NOU2pLbWRCMnNPd201AR7NEM1OV7OJhUuVyNzL50D6Qe-2xgoI4Hs4TUwQKWkCy7FgkAxVjZ-U256fJw_aem_egvlacZB-vgRJk3ERHHuvw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://x.com/5thCRG?fbclid=IwY2xjawKYxU5leHRuA2FlbQIxMABicmlkETFvc1NOU2pLbWRCMnNPd201AR7eNSfBHkzmbND99_AersRSharwLFYCcu41xDCuJhfVLExtVQPdS4PG-gvEtA_aem_0qgFgyElvBAcjS6hu_hbSg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <FaTwitter size={24} />
              </a>
            </div>
          </div>
        </motion.footer>
      </div>

      <style jsx>{`
        .shadow-text {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        footer a {
          transition: transform 0.2s ease-in-out;
        }
        footer a:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
