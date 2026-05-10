import React, { useState } from 'react';
import toast from 'react-hot-toast';

const PrivacyPolicy = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmMessage = "Are you sure? This will permanently delete your account, order history, and personal data in compliance with DPDP guidelines.";
    if (window.confirm(confirmMessage)) {
      setIsDeleting(true);
      try {
        // Mocking API call for deletion
        toast.success("Account and personal data have been permanently deleted.");
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } catch (err) {
        toast.error("Failed to delete account.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-8 bg-dark-secondary rounded-xl text-white">
      <h1 className="text-3xl font-bold mb-4 text-primary">Privacy Policy</h1>
      <p className="mb-4 text-gray-300">Your privacy is important to us. This policy outlines how we handle your personal data in compliance with the DPDP Act 2023.</p>
      
      <h2 className="text-xl font-semibold mb-2">1. Data Collection</h2>
      <p className="mb-4 text-gray-300">We collect information necessary to process your orders, such as your name, phone number, and address.</p>
      
      <h2 className="text-xl font-semibold mb-2">2. Data Usage</h2>
      <p className="mb-4 text-gray-300">Your data is strictly used for order fulfillment and improving our services.</p>
      
      <div className="mt-8 p-6 border border-red-500 bg-red-900/20 rounded-lg">
        <h3 className="text-red-500 font-bold text-lg mb-2">Danger Zone: Right to be Forgotten</h3>
        <p className="text-sm text-red-200 mb-4">You have the right to request the permanent deletion of your account and all associated personal data.</p>
        <button 
          onClick={handleDeleteAccount} 
          disabled={isDeleting} 
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
        >
          {isDeleting ? 'Deleting Data...' : 'Delete My Account & Data'}
        </button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
