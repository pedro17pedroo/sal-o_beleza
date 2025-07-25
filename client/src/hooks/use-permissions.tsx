import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { getQueryFn } from "../lib/queryClient";
import { PERMISSIONS, type PermissionType } from "@shared/schema";

type UserPermissions = {
  [key in PermissionType]: boolean;
};

type PermissionsContextType = {
  permissions: UserPermissions | null;
  isLoading: boolean;
  hasPermission: (permission: PermissionType) => boolean;
  canView: (section: 'appointments' | 'clients' | 'services' | 'financial' | 'professionals') => boolean;
  canManage: (section: 'appointments' | 'clients' | 'services' | 'financial') => boolean;
  isAdmin: boolean;
};

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Get user's permissions from backend
  const { data: permissions, isLoading } = useQuery<UserPermissions>({
    queryKey: ["/api/user/permissions"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const isAdmin = user?.role === "admin";

  // Check if user has specific permission
  const hasPermission = (permission: PermissionType): boolean => {
    if (isAdmin) return true; // Admin has all permissions
    return permissions?.[permission] || false;
  };

  // Check if user can view a section
  const canView = (section: 'appointments' | 'clients' | 'services' | 'financial' | 'professionals'): boolean => {
    if (isAdmin) return true;
    
    switch (section) {
      case 'appointments':
        return hasPermission(PERMISSIONS.VIEW_APPOINTMENTS);
      case 'clients':
        return hasPermission(PERMISSIONS.VIEW_CLIENTS);
      case 'services':
        return hasPermission(PERMISSIONS.VIEW_SERVICES);
      case 'financial':
        return hasPermission(PERMISSIONS.VIEW_FINANCIAL);
      case 'professionals':
        return isAdmin; // Only admin can view professionals
      default:
        return false;
    }
  };

  // Check if user can manage a section
  const canManage = (section: 'appointments' | 'clients' | 'services' | 'financial'): boolean => {
    if (isAdmin) return true;
    
    switch (section) {
      case 'appointments':
        return hasPermission(PERMISSIONS.MANAGE_APPOINTMENTS);
      case 'clients':
        return hasPermission(PERMISSIONS.MANAGE_CLIENTS);
      case 'services':
        return hasPermission(PERMISSIONS.MANAGE_SERVICES);
      case 'financial':
        return hasPermission(PERMISSIONS.MANAGE_FINANCIAL);
      default:
        return false;
    }
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions: permissions || null,
        isLoading,
        hasPermission,
        canView,
        canManage,
        isAdmin,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}