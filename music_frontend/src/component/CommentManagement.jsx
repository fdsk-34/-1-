import React, { useState, useEffect } from 'react';
import LoadingToast from '../component/LoadingToast';
import '../styles/CommentManagement.css';
import axios from 'axios';

// 모의 데이터
const mockComments = [
  { id: 'cmt1', user: { nickname: 'UserOne' }, content: '좋은 곡이에요!', resourceId: 'song1', resourceType: 'song', createdAt: '2025-08-01T12:00:00Z' },
  { id: 'cmt2', user: { nickname: 'UserTwo' }, content: '최고의 앨범!', resourceId: 'album1', resourceType: 'album', createdAt: '2025-08-02T14:00:00Z' },
];

const CommentManagement = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모의 데이터 로드
  useEffect(() => {
    // 실제 API 호출 (주석 처리)
    
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/comments/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
        });
        setComments(res.data);
      } catch (err) {
        setError(err.message || '댓글을 불러오는 데 실패했습니다.');
       
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
    
    
    setTimeout(() => {
      setComments(mockComments);
      setLoading(false);
    }, 1000);
  }, []);

  // 댓글 삭제 (모의)
  const handleDelete = (commentId) => {
    if (window.confirm('이 댓글을 삭제하시겠습니까?')) {
      setComments(comments.filter(comment => comment.id !== commentId));
      // 실제 API 호출 (주석 처리)
      // axios.delete(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/comments/${commentId}`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      // });
    }
  };

  return (
    <div className="comment-management-container">
      <h2 className="comment-management-title">댓글 관리</h2>
      <LoadingToast isLoading={loading} onDismiss={() => setLoading(false)} />
      {error && <p className="comment-management-error">{error}</p>}

      <div className="comment-management-list">
        {comments.length === 0 ? (
          <p className="comment-management-empty">표시할 댓글이 없습니다.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-management-item">
              <p className="comment-management-content">
                <strong>{comment.user?.nickname || '알 수 없는 사용자'}</strong>: {comment.content}
              </p>
              <p className="comment-management-info">
                ({comment.resourceType}: {comment.resourceId})
                <span className="comment-management-timestamp">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </p>
              <button
                onClick={() => handleDelete(comment.id)}
                className="comment-management-btn comment-management-btn-delete"
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentManagement;