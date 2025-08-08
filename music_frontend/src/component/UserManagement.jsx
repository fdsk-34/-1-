import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const { user, logout, apiClient } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', role: '', subscriptionPlan: '' });
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      window.showToast('관리자 권한이 필요합니다.', 'error');
      logout();
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        if (DEV_MODE) {
          setTimeout(() => {
            setUsers([
              { id: 1, email: 'user1@example.com', role: 'USER', subscriptionPlan: 'Free' },
              { id: 2, email: 'user2@example.com', role: 'USER', subscriptionPlan: 'Premium' },
              { id: 3, email: 'admin@example.com', role: 'ADMIN', subscriptionPlan: 'Pro' },
            ]);
            window.showToast('모의 사용자 목록을 불러왔습니다.', 'success');
            setLoading(false);
          }, 1000);
          return;
        }

        const response = await apiClient.get('/api/admin/users');
        setUsers(response.data);
        window.showToast('사용자 목록을 불러왔습니다.', 'success');
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError('사용자 목록을 불러오지 못했습니다.');
        window.showToast('사용자 목록을 불러오지 못했습니다.', 'error');
      } finally {
        if (!DEV_MODE) setLoading(false);
      }
    };
    fetchUsers();
  }, [user, logout, apiClient]);

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({ email: user.email, role: user.role, subscriptionPlan: user.subscriptionPlan });
  };

  const handleUpdate = async (userId) => {
    setLoading(true);
    try {
      if (DEV_MODE) {
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, ...editForm } : u))
        );
        window.showToast('사용자 정보가 수정되었습니다.', 'success');
      } else {
        await apiClient.put(`/api/admin/users/${userId}`, editForm);
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, ...editForm } : u))
        );
        window.showToast('사용자 정보가 수정되었습니다.', 'success');
      }
      setEditingUser(null);
      setEditForm({ email: '', role: '', subscriptionPlan: '' });
    } catch (error) {
      console.error('Failed to update user:', error);
      window.showToast('사용자 정보 수정에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    setLoading(true);
    try {
      if (DEV_MODE) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        window.showToast('사용자가 삭제되었습니다.', 'success');
      } else {
        await apiClient.delete(`/api/admin/users/${userId}`);
        setUsers(prev => prev.filter(u => u.id !== userId));
        window.showToast('사용자가 삭제되었습니다.', 'success');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      window.showToast('사용자 삭제에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <p className="loading-text">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management">
        <p className="admin-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <h1>사용자 관리</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>이메일</th>
            <th>역할</th>
            <th>구독 플랜</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                {editingUser === user.id ? (
                  <input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <select
                    value={editForm.subscriptionPlan}
                    onChange={(e) => setEditForm({ ...editForm, subscriptionPlan: e.target.value })}
                  >
                    <option value="Free">Free</option>
                    <option value="Premium">Premium</option>
                    <option value="Pro">Pro</option>
                  </select>
                ) : (
                  user.subscriptionPlan
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <>
                    <button onClick={() => handleUpdate(user.id)}>저장</button>
                    <button onClick={() => setEditingUser(null)}>취소</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(user)}>수정</button>
                    <button onClick={() => handleDelete(user.id)}>삭제</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;