import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const WaitingApprovalPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleResubmitClick = () => {
    navigate("/host-resubmit");
  };

  const isRejected = !!user?.hostRejectionReason && !user?.isKycSubmitted;
  const isResubmitted = user?.resubmissionCount > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold text-emerald-600 mb-4">
          {isRejected
            ? "Your Profile Was Rejected"
            : isResubmitted
            ? "Resubmitted for Review"
            : "Your Profile is Under Review"}
        </h2>

        {isRejected ? (
          <>
            <p className="text-gray-700 mb-4">
              Unfortunately, your profile was rejected by our admin team. Please
              see the reason below and resubmit your profile with corrections.
            </p>
            <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-1">Rejection Reason:</h3>
              <p>{user.hostRejectionReason}</p>
            </div>
            <button
              onClick={handleResubmitClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-xl shadow"
            >
              Update & Resubmit
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-4">
              {isResubmitted
                ? "You have updated and resubmitted your profile. Our Super Admin team is reviewing your changes."
                : "Thank you for completing your registration and subscription. Our Super Admin team is currently reviewing your KYC documents."}
            </p>
            <p className="text-sm text-gray-500">
              You will be notified once your profile is approved.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default WaitingApprovalPage;
