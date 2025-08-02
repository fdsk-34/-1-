import React, { useState, useEffect } from 'react';
import  FilterButtons  from '../component/FilterButtons.jsx';
import LoadingToast from '../component/LoadingToast';
import '../styles/UserManagement.css';
import axios from 'axios';

// 모의 데이터
const mockUsers = [
  { id: 'user1', email: 'user1@example.com', nickname: 'UserOne', role: 'USER', createdAt: '2025-07-01' },
  { id: 'user2', email: 'user2@example.com', nickname: 'UserTwo', role: 'USER', createdAt: '2025-07-02' },
  { id: 'admin1', email: 'admin@example.com', nickname: 'Admin', role: 'ADMIN', createdAt: '2025-06-01' },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = [
    { label: '전체', value: 'all' },
    { label: '일반 사용자', value: 'USER' },
    { label: '관리자', value: 'ADMIN' },
  ];

  // 모의 데이터 로드
  useEffect(() => {
    // 실제 API 호출 (주석 처리)
    
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError(err.message || '사용자 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    
    
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // 검색 및 필터링된 사용자 목록
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.nickname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || user.role === filter;
    return matchesSearch && matchesFilter;
  });

  // 사용자 삭제 (모의)
  const handleDelete = (userId) => {
    if (window.confirm('이 사용자를 삭제하시겠습니까?')) {
      setUsers(users.filter(user => user.id !== userId));
      // 실제 API 호출 (주석 처리)
      // axios.delete(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/users/${userId}`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      // });
    }
  };

  // 사용자 수정 (모의)
  const handleEdit = (userId) => {
    alert(`사용자 ${userId} 수정 (모달 또는 페이지 이동 구현 필요)`);
  };

  return (
    <div className="user-management-container">
      <h2 className="user-management-title">사용자 관리</h2>
      <LoadingToast isLoading={loading} onDismiss={() => setLoading(false)} />
      {error && <p className="user-management-error">{error}</p>}

      <div className="user-management-controls">
        <input
          type="text"
          placeholder="이메일 또는 닉네임으로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="user-management-search"
        />
        <FilterButtons
          currentFilter={filter}
          onFilterChange={setFilter}
          filters={filters}
        />
      </div>

      <table className="user-management-table">
        <thead>
          <tr>
            <th>이메일</th>
            <th>닉네임</th>
            <th>권한</th>
            <th>가입일</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="5" className="user-management-empty">사용자 없음</td>
            </tr>
          ) : (
            filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.nickname}</td>
                <td>{user.role}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleEdit(user.id)}
                    className="user-management-btn user-management-btn-edit"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="user-management-btn user-management-btn-delete"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;