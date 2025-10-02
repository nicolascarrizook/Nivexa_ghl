import { useEffect, useState } from 'react';
import { projectService, ProjectWithDetails } from '../services/ProjectService';
import type { ProjectFormData } from '../types/project.types';

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const data = await projectService.getProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const refetch = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error refetching projects:', err);
      setError('Failed to refetch projects');
    }
  };

  return { 
    data: projects, 
    isLoading, 
    error,
    refetch
  };
}

export function useProject(id: string) {
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      try {
        const data = await projectService.getProject(id);
        setProject(data);
        setError(null);
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id]);

  return { 
    data: project, 
    isLoading, 
    error 
  };
}

export function useCreateProject() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = async (data: ProjectFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const project = await projectService.createProjectFromForm(data);
      return project;
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    mutateAsync, 
    isLoading, 
    error 
  };
}