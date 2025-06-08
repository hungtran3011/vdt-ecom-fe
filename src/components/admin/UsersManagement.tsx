'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Card from '@/components/Card';
import { List, ListItem } from '@/components/List';
import Chip from '@/components/Chip';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import TextField from '@/components/TextField';
import Checkbox from '@/components/Checkbox';
import ImageUploadZone from '@/components/ImageUploadZone';
import { AdminUser, UserRegistrationRequest, UserUpdateRequest } from '@/types/User';
import { 
  useAllUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser,
  useAssignRole,
  useRemoveRole,
  useResetPassword,
  useSetUserEnabled 
} from '@/hooks/useUsers';
import { t } from '@/utils/localization';
import { useSnackbar } from '@/hooks/useSnackbar';

interface UsersManagementProps {
  title?: string;
  className?: string;
  onUserSelect?: (user: AdminUser) => void;
}

// Extended interfaces for forms
interface ExtendedUserRegistrationRequest extends UserRegistrationRequest {
  roles: string[];
}

interface ExtendedUserUpdateRequest extends UserUpdateRequest {
  roles: string[];
}

const UsersManagement: React.FC<UsersManagementProps> = ({
  title = t('sections.usersManagement'),
  className = '',
  onUserSelect
}) => {
  // State management
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [bulkActionMode, setBulkActionMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ExtendedUserRegistrationRequest>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    roles: []
  });
  const [editFormData, setEditFormData] = useState<ExtendedUserUpdateRequest>({
    firstName: '',
    lastName: '',
    email: '',
    roles: []
  });
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');

  // Hooks
  const { showSnackbar } = useSnackbar();
  
  // API hooks
  const { 
    data: usersResponse, 
    isLoading, 
    error, 
    refetch 
  } = useAllUsers({
    page: currentPage,
    size: pageSize,
    search: searchTerm
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const assignRoleMutation = useAssignRole();
  const removeRoleMutation = useRemoveRole();
  const resetPasswordMutation = useResetPassword();
  const setUserEnabledMutation = useSetUserEnabled();

  // Computed values
  const users = useMemo(() => usersResponse?.content || [], [usersResponse?.content]);
  const totalElements = usersResponse?.totalElements || 0;
  const totalPages = usersResponse?.totalPages || 0;

  // Available roles for assignment
  const availableRoles = [
    'admin',
    'manager', 
    'user',
    'customer',
    'staff'
  ];

  // Reset form data
  const resetFormData = useCallback(() => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      roles: []
    });
    setProfileImageUrl('');
  }, []);

  const resetEditFormData = useCallback(() => {
    setEditFormData({
      firstName: '',
      lastName: '',
      email: '',
      roles: []
    });
    setEditingUser(null);
    setProfileImageUrl('');
  }, []);

  // Handlers
  const handleCreateUser = useCallback(async () => {
    try {
      if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
        showSnackbar(t('form.validation.required'), 'error');
        return;
      }

      const userData: UserRegistrationRequest = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password,
        roles: formData.roles
      };

      await createUserMutation.mutateAsync(userData);
      showSnackbar(t('messages.success.created'), 'success');
      resetFormData();
      setShowCreateForm(false);
      refetch();
    } catch (err) {
      console.error('Error creating user:', err);
      showSnackbar(t('messages.error.general'), 'error');
    }
  }, [formData, createUserMutation, showSnackbar, resetFormData, refetch]);

  const handleUpdateUser = useCallback(async () => {
    if (!editingUser) return;
    
    try {
      const updateData: UserUpdateRequest = {
        firstName: editFormData.firstName.trim(),
        lastName: editFormData.lastName.trim(),
        email: editFormData.email.trim()
      };

      await updateUserMutation.mutateAsync({ 
        userId: editingUser.id, 
        userData: updateData 
      });

      // Handle role updates separately
      if (editFormData.roles) {
        for (const role of editFormData.roles) {
          if (!editingUser.roles.includes(role)) {
            await assignRoleMutation.mutateAsync({ userId: editingUser.id, roleName: role });
          }
        }
        
        for (const role of editingUser.roles) {
          if (!editFormData.roles.includes(role)) {
            await removeRoleMutation.mutateAsync({ userId: editingUser.id, roleName: role });
          }
        }
      }

      showSnackbar(t('messages.success.updated'), 'success');
      resetEditFormData();
      refetch();
    } catch (err) {
      console.error('Error updating user:', err);
      showSnackbar(t('messages.error.general'), 'error');
    }
  }, [editingUser, editFormData, updateUserMutation, assignRoleMutation, removeRoleMutation, showSnackbar, resetEditFormData, refetch]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    if (!confirm(t('messages.confirmation.delete'))) return;

    try {
      await deleteUserMutation.mutateAsync(userId);
      showSnackbar(t('messages.success.deleted'), 'success');
      refetch();
    } catch (err) {
      console.error('Error deleting user:', err);
      showSnackbar(t('messages.error.general'), 'error');
    }
  }, [deleteUserMutation, showSnackbar, refetch]);

  const handleBulkDelete = useCallback(async () => {
    if (!confirm(t('messages.confirmation.delete'))) return;

    try {
      const deletePromises = Array.from(selectedUsers).map(userId =>
        deleteUserMutation.mutateAsync(userId)
      );
      await Promise.all(deletePromises);
      
      showSnackbar(t('messages.success.deleted'), 'success');
      setSelectedUsers(new Set());
      setBulkActionMode(false);
      refetch();
    } catch (err) {
      console.error('Error bulk deleting users:', err);
      showSnackbar(t('messages.error.general'), 'error');
    }
  }, [selectedUsers, deleteUserMutation, showSnackbar, refetch]);

  const handleResetPassword = useCallback(async (userId: string) => {
    if (!confirm(t('users.resetPasswordConfirm'))) return;

    try {
      const newPassword = Math.random().toString(36).slice(-12);
      await resetPasswordMutation.mutateAsync({ 
        userId, 
        newPassword,
        temporary: true 
      });
      showSnackbar(t('users.passwordResetSuccess'), 'success');
    } catch (err) {
      console.error('Error resetting password:', err);
      showSnackbar(t('messages.error.general'), 'error');
    }
  }, [resetPasswordMutation, showSnackbar]);

  const handleToggleUserEnabled = useCallback(async (userId: string, enabled: boolean) => {
    try {
      await setUserEnabledMutation.mutateAsync({ userId, enabled });
      showSnackbar(
        enabled ? t('users.userEnabled') : t('users.userDisabled'), 
        'success'
      );
      refetch();
    } catch (err) {
      console.error('Error toggling user enabled status:', err);
      showSnackbar(t('messages.error.general'), 'error');
    }
  }, [setUserEnabledMutation, showSnackbar, refetch]);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAllUsers = useCallback(() => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)));
    }
  }, [selectedUsers.size, users]);

  const handleEditUser = useCallback((user: AdminUser) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      roles: user.roles || []
    });
  }, []);

  const handleImageUpload = useCallback((imageUrl: string) => {
    setProfileImageUrl(imageUrl);
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-(--md-sys-color-on-surface-variant)">
            {t('messages.info.loading')}
          </div>
        </div>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-(--md-sys-color-error)">
            {t('messages.error.general')}: {error.message}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-(--md-sys-color-on-surface)">
            {title}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              label={t('actions.refresh')}
              hasIcon
              icon="refresh"
              onClick={() => refetch()}
              disabled={isLoading}
            />
            <Button
              variant="filled"
              label={t('users.addUser')}
              hasIcon
              icon="person_add"
              onClick={() => setShowCreateForm(true)}
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label={t('users.searchUsers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('users.searchUsersPlaceholder')}
            leadingIcon="search"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              checked={bulkActionMode}
              onChange={(checked) => {
                setBulkActionMode(checked);
                if (!checked) {
                  setSelectedUsers(new Set());
                }
              }}
              label=""
            />
            <span className="text-sm text-(--md-sys-color-on-surface)">
              {t('actions.selectMode')}
            </span>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {bulkActionMode && selectedUsers.size > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-(--md-sys-color-on-surface)">
              {selectedUsers.size} {t('users.usersSelected')}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                label={t('actions.delete')}
                hasIcon
                icon="delete"
                onClick={handleBulkDelete}
                disabled={deleteUserMutation.isPending}
              />
              <Button
                variant="text"
                label={t('actions.cancel')}
                onClick={() => {
                  setSelectedUsers(new Set());
                  setBulkActionMode(false);
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <div className="p-4">
          {bulkActionMode && (
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={selectedUsers.size === users.length && users.length > 0}
                onChange={handleSelectAllUsers}
                label=""
              />
              <span className="text-sm text-(--md-sys-color-on-surface)">
                {t('actions.selectAll')}
              </span>
            </div>
          )}
        </div>
        
        <List>
          {users.map((user) => (
            <ListItem
              key={user.id}
              onClick={() => !bulkActionMode && onUserSelect?.(user)}
              leading={
                <div className="flex items-center gap-3">
                  {bulkActionMode && (
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      label=""
                    />
                  )}
                  <div className="h-12 w-12 rounded-full bg-(--md-sys-color-surface-container-highest) flex items-center justify-center overflow-hidden">
                    {profileImageUrl ? (
                      <Image 
                        src={profileImageUrl} 
                        alt={`${user.firstName} ${user.lastName}`}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-(--md-sys-color-on-surface-variant) text-lg mdi">
                        person
                      </span>
                    )}
                  </div>
                </div>
              }
              trailing={
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-1">
                      {user.roles.map((role) => (
                        <Chip
                          key={role}
                          variant="assist"
                          color="primary"
                          label={role}
                          className="text-xs"
                        />
                      ))}
                    </div>
                    <Chip
                      variant={user.enabled ? "assist" : "filter"}
                      color={user.enabled ? "tertiary" : "error"}
                      label={user.enabled ? t('status.active') : t('status.inactive')}
                    />
                  </div>
                  {!bulkActionMode && (
                    <div className="flex gap-1">
                      <IconButton
                        icon="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditUser(user);
                        }}
                        disabled={updateUserMutation.isPending}
                      />
                      <IconButton
                        icon="lock_reset"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetPassword(user.id);
                        }}
                        disabled={resetPasswordMutation.isPending}
                      />
                      <IconButton
                        icon={user.enabled ? "block" : "check_circle"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleUserEnabled(user.id, !user.enabled);
                        }}
                        disabled={setUserEnabledMutation.isPending}
                      />
                      <IconButton
                        icon="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user.id);
                        }}
                        disabled={deleteUserMutation.isPending}
                      />
                    </div>
                  )}
                </div>
              }
              supportingText={`${user.email} • ${t('users.joinDate')}: ${new Date(user.createdAt).toLocaleDateString('vi-VN')}`}
            >
              <div className="font-medium text-(--md-sys-color-on-surface)">
                {user.firstName} {user.lastName}
              </div>
            </ListItem>
          ))}
        </List>

        {/* Pagination */}
        <div className="p-4 border-t border-(--md-sys-color-outline-variant) flex items-center justify-between">
          <span className="text-sm text-(--md-sys-color-on-surface-variant)">
            {t('pagination.showing')} {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)} {t('pagination.of')} {totalElements}
          </span>
          <div className="flex items-center gap-2">
            <IconButton
              icon="chevron_left"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            />
            <span className="text-sm text-(--md-sys-color-on-surface)">
              {currentPage + 1} / {totalPages}
            </span>
            <IconButton
              icon="chevron_right"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
            />
          </div>
        </div>
      </Card>

      {/* Create User Form */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface)">
              {t('users.addUser')}
            </h3>
            <IconButton
              icon="close"
              onClick={() => {
                setShowCreateForm(false);
                resetFormData();
              }}
            />
          </div>

          <div className="space-y-4">
            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-(--md-sys-color-on-surface) mb-2">
                {t('users.profilePicture')}
              </label>
              <ImageUploadZone
                value={profileImageUrl}
                onChange={handleImageUpload}
                label={t('users.uploadProfilePicture')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label={t('users.userName')}
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
              <TextField
                label={t('users.userEmail')}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <TextField
                label={t('form.name')}
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
              <TextField
                label={t('users.lastName')}
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
              <TextField
                label={t('form.password')}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            {/* Roles */}
            <div>
              <label className="block text-sm font-medium text-(--md-sys-color-on-surface) mb-2">
                {t('users.role')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableRoles.map((role) => (
                  <div key={role} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.roles?.includes(role) || false}
                      onChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            roles: [...(prev.roles || []), role]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            roles: (prev.roles || []).filter((r: string) => r !== role)
                          }));
                        }
                      }}
                      label=""
                    />
                    <span className="text-sm text-(--md-sys-color-on-surface)">
                      {role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outlined"
                label={t('actions.cancel')}
                onClick={() => {
                  setShowCreateForm(false);
                  resetFormData();
                }}
              />
              <Button
                variant="filled"
                label={t('actions.create')}
                onClick={handleCreateUser}
                disabled={
                  createUserMutation.isPending ||
                  !formData.username.trim() ||
                  !formData.email.trim() ||
                  !formData.password.trim()
                }
              />
            </div>
          </div>
        </Card>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface)">
              {t('users.editUser')}
            </h3>
            <IconButton
              icon="close"
              onClick={resetEditFormData}
            />
          </div>

          <div className="space-y-4">
            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-(--md-sys-color-on-surface) mb-2">
                {t('users.profilePicture')}
              </label>
              <ImageUploadZone
                value={profileImageUrl}
                onChange={handleImageUpload}
                label={t('users.uploadProfilePicture')}
              />
              
              {profileImageUrl && (
                <div className="mt-2">
                  <Image
                    src={profileImageUrl}
                    alt="Current profile"
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label={t('form.name')}
                value={editFormData.firstName}
                onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
              <TextField
                label={t('users.lastName')}
                value={editFormData.lastName}
                onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
              <TextField
                label={t('users.userEmail')}
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            {/* Roles */}
            <div>
              <label className="block text-sm font-medium text-(--md-sys-color-on-surface) mb-2">
                {t('users.role')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableRoles.map((role) => (
                  <div key={role} className="flex items-center gap-2">
                    <Checkbox
                      checked={editFormData.roles?.includes(role) || false}
                      onChange={(checked) => {
                        if (checked) {
                          setEditFormData(prev => ({
                            ...prev,
                            roles: [...(prev.roles || []), role]
                          }));
                        } else {
                          setEditFormData(prev => ({
                            ...prev,
                            roles: (prev.roles || []).filter((r: string) => r !== role)
                          }));
                        }
                      }}
                      label=""
                    />
                    <span className="text-sm text-(--md-sys-color-on-surface)">
                      {role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outlined"
                label={t('actions.cancel')}
                onClick={resetEditFormData}
              />
              <Button
                variant="filled"
                label={t('actions.update')}
                onClick={handleUpdateUser}
                disabled={
                  updateUserMutation.isPending ||
                  !editFormData.firstName.trim() ||
                  !editFormData.lastName.trim() ||
                  !editFormData.email.trim()
                }
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UsersManagement;
