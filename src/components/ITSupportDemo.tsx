import React, { useState } from 'react';
import { Monitor, Plus, FileText } from 'lucide-react';
import ITSupportTicketForm from './ITSupportTicketForm';
import NewTicketRequestForm from './NewTicketRequestForm';

/**
 * Demo component to test the IT Support Ticket Form
 * You can use this to view and test the form independently
 */
const ITSupportDemo: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNewRequestFormOpen, setIsNewRequestFormOpen] = useState(false);

  const handleTicketSubmit = (ticketData: any) => {
    console.log('IT Support ticket submitted:', ticketData);
    alert('IT Support ticket submitted successfully!');
  };

  const handleNewRequestSubmit = (ticketData: any) => {
    console.log('New ticket request submitted:', ticketData);
    alert('New ticket request submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Monitor className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              IT Support Ticket Form Demo
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Click the button below to open the IT Support ticket form
          </p>
        </div>

        {/* Demo Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              IT Support Ticket Form
            </button>
            <button
              onClick={() => setIsNewRequestFormOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <FileText className="w-5 h-5" />
              New Ticket Request Form
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            How to Access the Form
          </h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p><strong>IT Support Form:</strong> Click the blue button above to open the comprehensive IT Support ticket form</p>
            <p><strong>New Request Form:</strong> Click the green button above to open the new ticket request form (matches the design in your image)</p>
            <p><strong>Alternative Access:</strong> Go to TicketGallery → Quick Access → Click "IT Support" template</p>
            <p><strong>Integration:</strong> Use either form component in your own components as needed</p>
          </div>
        </div>

        {/* IT Support Ticket Form */}
        <ITSupportTicketForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleTicketSubmit}
        />

        {/* New Ticket Request Form */}
        <NewTicketRequestForm
          isOpen={isNewRequestFormOpen}
          onClose={() => setIsNewRequestFormOpen(false)}
          onSubmit={handleNewRequestSubmit}
        />

      </div>
    </div>
  );
};

export default ITSupportDemo;
