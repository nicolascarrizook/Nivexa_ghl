import { Button } from "@/design-system/components/inputs";
import { Spinner } from "@/design-system/components/feedback";
import { SectionCard as Card } from "@/design-system/components/layout";
// Temporary Alert component until available in design-system
const Alert = ({ variant, title, children }: { variant: string; title: string; children: string }) => (
  <div className={`rounded-lg border p-4 ${variant === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
    {title && <h4 className="font-medium mb-2">{title}</h4>}
    <p className={`text-sm ${variant === 'error' ? 'text-red-800' : 'text-gray-800'}`}>{children}</p>
  </div>
);

// Temporary Badge component until available in design-system
const Badge = ({ variant, size, children }: { variant: string; size: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
    variant === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {children}
  </span>
);

// Temporary Input component until available in design-system
const Input = ({ label, value, onChange, placeholder, required }: { 
  label: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);
import { useState } from "react";
import {
  useCreateWorkspace,
  useDeleteWorkspace,
  useWorkspaces,
} from "../hooks/useWorkspaces";

interface WorkspaceListProps {
  userId: string;
}

export function WorkspaceList({ userId }: WorkspaceListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");

  // Fetch workspaces
  const { data: workspaces, isLoading, error } = useWorkspaces(userId);

  // Mutations
  const createWorkspace = useCreateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    try {
      await createWorkspace.mutateAsync({
        name: newWorkspaceName,
        description: newWorkspaceDescription || null,
        user_id: userId,
        settings: {},
        is_active: true,
      });

      // Reset form
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this workspace?")) {
      try {
        await deleteWorkspace.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete workspace:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        title="Error loading workspaces"
        children={error.message || "An unexpected error occurred"}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-primary">Workspaces</h2>
          <p className="text-sm text-tertiary mt-1">
            Manage your AI workspace environments
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="primary"
          size="md"
        >
          {showCreateForm ? "Cancel" : "+ New Workspace"}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card variant="flat" className="p-6">
          <h3 className="text-lg font-light text-primary mb-4">
            Create New Workspace
          </h3>
          <div className="space-y-4">
            <Input
              label="Workspace Name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Enter workspace name"
              required
            />
            <Input
              label="Description (optional)"
              value={newWorkspaceDescription}
              onChange={(e) => setNewWorkspaceDescription(e.target.value)}
              placeholder="Enter workspace description"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleCreateWorkspace}
                variant="primary"
                disabled={!newWorkspaceName.trim() || createWorkspace.isPending}
              >
                {createWorkspace.isPending ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" color="white" />
                    Creating...
                  </span>
                ) : (
                  "Create Workspace"
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewWorkspaceName("");
                  setNewWorkspaceDescription("");
                }}
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Workspace List */}
      {workspaces && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} variant="flat" className="relative">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-normal text-primary">
                    {workspace.name}
                  </h3>
                  <Badge
                    variant={workspace.is_active ? "success" : "default"}
                    size="sm"
                  >
                    {workspace.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {workspace.description && (
                  <p className="text-sm text-secondary mb-4">
                    {workspace.description}
                  </p>
                )}

                <div className="text-xs text-tertiary mb-4">
                  Created: {new Date(workspace.created_at).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    Open
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWorkspace(workspace.id)}
                    disabled={deleteWorkspace.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="flat" className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-light text-primary mb-2">
              No workspaces yet
            </h3>
            <p className="text-sm text-tertiary mb-6">
              Create your first workspace to get started with AI agents and
              pipelines.
            </p>
            <Button onClick={() => setShowCreateForm(true)} variant="primary">
              Create First Workspace
            </Button>
          </div>
        </Card>
      )}

      {/* Error Messages */}
      {createWorkspace.isError && (
        <Alert
          variant="error"
          title="Failed to create workspace"
          children={createWorkspace.error?.message || "Please try again"}
        />
      )}

      {deleteWorkspace.isError && (
        <Alert
          variant="error"
          title="Failed to delete workspace"
          children={deleteWorkspace.error?.message || "Please try again"}
        />
      )}
    </div>
  );
}
