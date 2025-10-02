import type { Meta, StoryObj } from '@storybook/react';
import { ClientSearch } from './ClientSearch';
import { useState } from 'react';

const meta = {
  title: 'Modules/Clients/ClientSearch',
  component: ClientSearch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClientSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock client data for stories (unused in current stories but kept for reference)
/*
const mockSearchResults = [
  {
    id: '1',
    name: 'María García',
    email: 'maria@ejemplo.com',
    phone: '+54 11 1234-5678',
  },
  {
    id: '2',
    name: 'Carlos López',
    email: 'carlos@ejemplo.com',
    phone: '+54 11 2345-6789',
  },
  {
    id: '3',
    name: 'Ana Martínez',
    email: 'ana@ejemplo.com',
    phone: '+54 11 3456-7890',
  },
];
*/

// Interactive wrapper for the search component
const ClientSearchWrapper = () => {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    console.log('Client selected:', client);
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
    console.log('Create new client triggered');
  };

  const handleReset = () => {
    setSelectedClient(null);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Client Search Component
        </h2>
        
        <ClientSearch
          onSelectClient={handleSelectClient}
          onCreateNew={handleCreateNew}
          selectedClientId={selectedClient?.id}
          placeholder="Search for client by name, email, or phone..."
        />
      </div>

      {selectedClient && (
        <div className="bg-gray-900 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-semibold">
              Selected Client
            </h3>
            <button
              onClick={handleReset}
              className="text-gray-600 text-sm hover:text-gray-600"
            >
              Clear Selection
            </button>
          </div>
          <div className="text-gray-600 space-y-1">
            <div>Name: {selectedClient.name}</div>
            <div>Email: {selectedClient.email}</div>
            <div>Phone: {selectedClient.phone}</div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-semibold">
              Create New Client
            </h3>
            <button
              onClick={handleReset}
              className="text-gray-600 text-sm hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
          <div className="text-gray-600">
            Create new client modal would open here...
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Component Features:
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Real-time search with debouncing</li>
          <li>• Keyboard navigation (↑↓ arrows + Enter)</li>
          <li>• Search by name, email, phone, or tax ID</li>
          <li>• "Create new" option when no results found</li>
          <li>• Loading states during search</li>
          <li>• Fuzzy matching for better results</li>
        </ul>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <ClientSearchWrapper />,
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Type to search for existing clients...',
    onSelectClient: (client) => console.log('Selected:', client),
    onCreateNew: () => console.log('Create new'),
  },
};

export const WithAutoFocus: Story = {
  args: {
    autoFocus: true,
    placeholder: 'Search clients...',
    onSelectClient: (client) => console.log('Selected:', client),
    onCreateNew: () => console.log('Create new'),
  },
};

export const WithSelectedClient: Story = {
  args: {
    selectedClientId: '123',
    placeholder: 'Search clients...',
    onSelectClient: (client) => console.log('Selected:', client),
    onCreateNew: () => console.log('Create new'),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Search disabled...',
    onSelectClient: (client) => console.log('Selected:', client),
    onCreateNew: () => console.log('Create new'),
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'border-2 border-gray-200',
    placeholder: 'Custom styled search...',
    onSelectClient: (client) => console.log('Selected:', client),
    onCreateNew: () => console.log('Create new'),
  },
};