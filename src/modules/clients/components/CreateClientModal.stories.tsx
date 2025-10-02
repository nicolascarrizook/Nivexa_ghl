import type { Meta, StoryObj } from '@storybook/react';
import { CreateClientModal } from './CreateClientModal';
import { useState } from 'react';

const meta = {
  title: 'Modules/Clients/CreateClientModal',
  component: CreateClientModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CreateClientModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle modal state
const CreateClientModalWrapper = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [createdClient, setCreatedClient] = useState<any>(null);

  const handleClose = () => {
    setIsOpen(false);
    // Reopen after a short delay for demo purposes
    setTimeout(() => {
      setIsOpen(true);
      setCreatedClient(null);
    }, 500);
  };

  const handleClientCreated = (client: any) => {
    setCreatedClient(client);
    console.log('Client created:', client);
    handleClose();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Create Client Modal Demo
        </h1>
        
        <div className="bg-white rounded-lg  border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Instructions
          </h2>
          <p className="text-gray-600 mb-4">
            This modal demonstrates the client creation form with:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Blurred backdrop instead of solid overlay</li>
            <li>Form validation for required fields</li>
            <li>Email and tax ID duplicate checking</li>
            <li>Icons for visual context</li>
            <li>Proper text color (black) for all inputs</li>
            <li>Responsive design with scrollable content</li>
          </ul>
        </div>

        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Open Modal
          </button>
        )}

        {createdClient && (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mt-4">
            <h3 className="text-gray-600 font-semibold mb-2">
              Client Created Successfully!
            </h3>
            <pre className="text-sm text-gray-600">
              {JSON.stringify(createdClient, null, 2)}
            </pre>
          </div>
        )}

        {/* Sample background content to show blur effect */}
        <div className="mt-8 space-y-4">
          <div className="bg-white rounded-lg  border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Background Content
            </h3>
            <p className="text-gray-600">
              This content will be blurred when the modal is open, demonstrating
              the backdrop-blur effect instead of a solid black overlay.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-200 rounded-lg p-4">
              <div className="text-gray-600 font-semibold">Card 1</div>
              <div className="text-gray-600 text-sm mt-1">Sample content</div>
            </div>
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
              <div className="text-gray-600 font-semibold">Card 2</div>
              <div className="text-gray-600 text-sm mt-1">Sample content</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-purple-900 font-semibold">Card 3</div>
              <div className="text-purple-700 text-sm mt-1">Sample content</div>
            </div>
          </div>
        </div>
      </div>

      <CreateClientModal
        isOpen={isOpen}
        onClose={handleClose}
        onClientCreated={handleClientCreated}
        initialName=""
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <CreateClientModalWrapper />,
};

export const WithInitialName: Story = {
  args: {
    isOpen: true,
    initialName: 'Juan Pérez',
    onClose: () => console.log('Modal closed'),
    onClientCreated: (client) => console.log('Client created:', client),
  },
};

export const ModalClosed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Modal closed'),
    onClientCreated: (client) => console.log('Client created:', client),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal in closed state - nothing should be rendered',
      },
    },
  },
};