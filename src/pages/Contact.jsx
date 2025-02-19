import React from "react";

function Contact() {
  return (
    <div className="container mx-auto p-4 max-w-md text-center">
      <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
      <p>
        For inquiries or feedback, please email us at:
      </p>
      <p className="mt-2 underline">
        <a href="mailto:info@quickwordgames">info@quickwordgames</a>
      </p>
    </div>
  );
}

export default Contact;
