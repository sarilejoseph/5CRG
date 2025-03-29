import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Other page content here */}

      <footer className="bg-gray-900 text-gray-400 text-sm text-center py-4 mt-auto">
        <p>
          &copy; {new Date().getFullYear()} 5th Civil Relations Group, CRSAFP.
          All rights reserved.
        </p>
        <p className="mt-1">Committed to service, integrity, and excellence.</p>
      </footer>
    </div>
  );
};

export default Footer;
