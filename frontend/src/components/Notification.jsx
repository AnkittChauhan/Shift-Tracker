import React from "react";

const Notification = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow">
      {message}
    </div>
  );
};

export default Notification;