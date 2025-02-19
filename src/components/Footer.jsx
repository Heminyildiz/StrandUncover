import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-100 mt-8 py-4 text-center text-sm text-gray-700">
      <div className="container mx-auto flex flex-col gap-2 items-center justify-center">
        <div>
          <Link to="/privacy-policy" className="underline mx-2">
            Privacy Policy
          </Link>
          <Link to="/contact" className="underline mx-2">
            Email Contact
          </Link>
        </div>
        <p className="text-xs text-gray-500 max-w-lg mx-auto mt-2">
          Disclaimer: Strand Uncover is an independent product and is not
          affiliated with, nor has it been authorized, sponsored, or otherwise
          approved by The New York Times Company. We encourage you to play the
          daily NYT Strands game on New York Times website.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
