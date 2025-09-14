import React from "react";
import RegisterForm from "../components/RegisterForm";

const RegisterTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Registration Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the registration form functionality
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterTestPage;
