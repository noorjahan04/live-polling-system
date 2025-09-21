import React from 'react';
import { UserX } from 'lucide-react';

function KickedOutPage() {
  const handleGoHome = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserX className="text-white" size={32} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">You Have Been Kicked Out</h1>
          <p className="text-gray-600 text-lg mb-6">
            The teacher has removed you from this session.
          </p>
        </div>

        <div className="bg-red-50 rounded-xl p-6 mb-6">
          <p className="text-red-700 font-medium">
            You can no longer participate in this poll session.
          </p>
        </div>

        <button
          onClick={handleGoHome}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold text-lg rounded-xl hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

export default KickedOutPage;