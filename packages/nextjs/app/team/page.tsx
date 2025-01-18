"use client";

import React, { useState } from "react";
import Image from "next/image";

// Define the type for a team member
type TeamMember = {
  name: string;
  role: string;
  image: string;
  description: string;
};

const Team = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Karatekid⨀5",
      role: "Developer",
      image: "/images/kid.jpg",
      description: "Karatekid⨀5 is a frontend wizard with a passion for creating immersive user experiences.",
    },
    {
      name: "Ravel",
      role: "Developer",
      image: "/images/ravel.jpg",
      description: "Ravel is a blockchain genius who ensures secure and seamless smart contract interactions.",
    },
    {
      name: "MarKrypto",
      role: "Designer",
      image: "/images/mark.jpg",
      description: "MarKrypto is a UI/UX expert who brings creativity and usability together in stunning designs.",
    },
  ];

  // State for modal visibility and selected team member
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const openModal = (member: TeamMember) => {
    setSelectedMember(member); // Set the selected member to show in the modal
  };

  const closeModal = () => {
    setSelectedMember(null); // Clear the selected member to close the modal
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center flex-col"
      style={{
        backgroundImage: `url('/images/BG_team.png')`,
      }}
    >
      <h2 className="text-center text-3xl font-bold mb-8 text-white">
        Meet the Team
      </h2>
      <p className="text-center text-lg mb-12 text-white">
        We’re the passionate team behind Monanimal Wars!<br />
        Click our cards and get to know us better!
      </p>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            onClick={() => openModal(member)} // Open the modal on card click
            className="bg-white/80 backdrop-blur-sm text-center rounded-3xl shadow-lg flex flex-col h-full transform transition-transform duration-300 hover:scale-105 cursor-pointer"
            style={{
              width: "286px",
              height: "408px",
              backgroundImage: "url('/images/bgg.jpg')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex-1 flex items-center justify-center">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={120}
                  height={150}
                  className="mx-auto rounded-full"
                />
              </div>
              <div className="mt-2 flex flex-col items-center h-36">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-md my-1">{member.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 w-3/4 max-w-md shadow-lg relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white font-bold rounded hover:bg-red-600"
            >
              Close
            </button>

            {/* Modal Content */}
            <div className="text-center">
              <Image
                src={selectedMember.image}
                alt={selectedMember.name}
                width={150}
                height={150}
                className="mx-auto rounded-full mb-4"
              />
              <h3 className="text-2xl font-bold mb-2">{selectedMember.name}</h3>
              <p className="text-lg font-semibold mb-2">{selectedMember.role}</p>
              <p className="text-md text-gray-700">{selectedMember.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="mt-8 px-6 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default Team;
