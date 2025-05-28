"use client"
import React from "react";

interface GenZBadgeProps {
  text: string; 
}

const GenZBadge: React.FC<GenZBadgeProps> = ({ text }) => {
  return (
    <div className="genz-badge">
      <span>{text}</span>
      <style jsx>{`
        .genz-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #ff9a9e, #fad0c4);
          border-radius: 9999px; /* Fully rounded corners */
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          font-family: "Poppins", sans-serif;
          font-size: 1rem;
          font-weight: bold;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }

        .genz-badge:hover {
          transform: scale(1.05);
          box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
        }

        .genz-badge span {
          background: linear-gradient(90deg, #ffdde1, #ee9ca7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default GenZBadge;
