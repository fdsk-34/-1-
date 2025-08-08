import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Pagination from './Pagination';
import '../styles/CommentManagement.css';

const CommentManagement = () => {
  const { user, logout, apiClient } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // 초기 로딩 상태
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedFilters] = useState({});
  const [allComments, setAllComments] = useState([]); // 전체 댓글 데이터 저장
  const location = useLocation();
  const navigate = useNavigate();
  const DEV_MODE = true;

  // 개발자 모드용 더미 데이터 생성
  const generateDummyComments = useCallback(() => {
    const songs = [
      { id: 1, title: "SWITCH", artist: "IVE" },
      { id: 2, title: "UNFORGIVEN", artist: "LE SSERAFIM" },
      { id: 3, title: "ETA", artist: "NewJeans" },
      { id: 4, title: "Queencard", artist: "(G)I-DLE" },
      { id: 5, title: "Pink Venom", artist: "BLACKPINK" }
    ];

    const commentTemplates = [
      "이 노래 너무 좋아요! 계속 듣고 있어요 🎵",
      "가사가 너무 감동적이에요 ㅠㅠ",
      "이 아티스트 진짜 실력이 대단해요",
      "뮤직비디오도 완전 예술이네요 👍",
      "이 노래 들으면서 운동하고 있어요!",
      "친구들한테도 추천했어요 ✨",
      "라이브 무대 보고 싶어요",
      "다음 앨범도 기대됩니다",
      "이 곡으로 위로받았어요",
      "벌써 100번째 듣는 중이에요 😊"
    ];

    return Array.from({ length: 127 }, (_, i) => {
      const song = songs[Math.floor(Math.random() * songs.length)];
      const template = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
      return {
        id: i + 1,
        songId: song.id,
        songTitle: song.title,
        artistName: song.artist,
        userEmail: `user${String(i + 1).padStart(3, '0')}@example.com`,
        content: `${template} #${i + 1}`,
        createdAt: new Date(2025, 7, 1 + (i % 30), Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)).toISOString(),
        likes: Math.floor(Math.random() * 50),
        status: Math.random() > 0.9 ? 'reported' : 'active'
      };
    });
  }, []);

  const fetchComments = useCallback(async (search, filters, currentPage, pageSize, isInitial = false) => {
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }

    try {
      if (DEV_MODE) {
        // 초기 로딩시에만 더미 데이터 생성
        if (isInitial || allComments.length === 0) {
          const mockComments = generateDummyComments();
          setAllComments(mockComments);
          
          setTimeout(() => {
            let filtered = mockComments;
            
            // 검색 필터링
            if (search) {
              filtered = filtered.filter(c =>
                c.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                c.content.toLowerCase().includes(search.toLowerCase()) ||
                c.songTitle.toLowerCase().includes(search.toLowerCase()) ||
                c.artistName.toLowerCase().includes(search.toLowerCase())
              );
            }
            
            // 추가 필터링
            if (filters.songId) {
              filtered = filtered.filter(c => c.songId === Number(filters.songId));
            }
            if (filters.userEmail) {
              filtered = filtered.filter(c => c.userEmail.toLowerCase().includes(filters.userEmail.toLowerCase()));
            }
            if (filters.content) {
              filtered = filtered.filter(c => c.content.toLowerCase().includes(filters.content.toLowerCase()));
            }
            
            // 페이징 처리
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            setComments(filtered.slice(startIndex, endIndex));
            setTotal(filtered.length);
            
            if (isInitial) {
              window.showToast && window.showToast('댓글 관리 시스템을 불러왔습니다.', 'success');
              setInitialLoading(false);
            }
            setLoading(false);
          }, isInitial ? 1500 : 300);
        } else {
          // 이미 데이터가 있으면 클라이언트 사이드에서 필터링
          let filtered = allComments;
          
          if (search) {
            filtered = filtered.filter(c =>
              c.userEmail.toLowerCase().includes(search.toLowerCase()) ||
              c.content.toLowerCase().includes(search.toLowerCase()) ||
              c.songTitle.toLowerCase().includes(search.toLowerCase()) ||
              c.artistName.toLowerCase().includes(search.toLowerCase())
            );
          }
          
          const startIndex = (currentPage - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          setComments(filtered.slice(startIndex, endIndex));
          setTotal(filtered.length);
          setLoading(false);
        }
        return;
      }

      // 실제 API 호출
      const query = new URLSearchParams({
        page: currentPage,
        size: pageSize,
        ...(search && { search }),
        ...(filters.songId && { songId: filters.songId }),
        ...(filters.userEmail && { userEmail: filters.userEmail }),
        ...(filters.content && { content: filters.content }),
      }).toString();
      
      const response = await apiClient.get(`/api/admin/comments?${query}`);
      setComments(response.data.data);
      setTotal(response.data.total);
      
      if (isInitial) {
        window.showToast && window.showToast('댓글 목록을 불러왔습니다.', 'success');
        setInitialLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setError('댓글 목록을 불러오지 못했습니다.');
      window.showToast && window.showToast('댓글 목록을 불러오지 못했습니다.', 'error');
      setInitialLoading(false);
    } finally {
      setLoading(false);
    }
  }, [DEV_MODE, apiClient, allComments, generateDummyComments]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('search', term);
    queryParams.set('page', 1);
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    setLoading(true);
    try {
      if (DEV_MODE) {
        // 전체 데이터에서도 제거
        setAllComments(prev => prev.filter(comment => comment.id !== commentId));
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        setTotal(prev => prev - 1);
        window.showToast && window.showToast('댓글이 삭제되었습니다.', 'success');
      } else {
        await apiClient.delete(`/api/admin/comments/${commentId}`);
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        setTotal(prev => prev - 1);
        window.showToast && window.showToast('댓글이 삭제되었습니다.', 'success');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      window.showToast && window.showToast('댓글 삭제에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('page', newPage);
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(1);
    navigate(location.pathname);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('search') || '';
    const initialPage = parseInt(queryParams.get('page') || '1', 10);
    const initialSize = parseInt(queryParams.get('size') || '10', 10);

    setSearchTerm(initialSearch);
    setPage(initialPage);
    setSize(initialSize);

    // 첫 번째 로딩인지 확인
    const isInitial = allComments.length === 0;
    fetchComments(initialSearch, advancedFilters, initialPage, initialSize, isInitial);
  }, [location.search, fetchComments, advancedFilters, allComments.length]);

  if (!user || user.role !== 'ADMIN') {
    window.showToast && window.showToast('관리자 권한이 필요합니다.', 'error');
    logout();
    return null;
  }

  if (initialLoading) {
    return (
      <div className="comment-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">댓글 관리 시스템을 초기화하는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comment-management">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="admin-error">{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="comment-management">
      <div className="admin-header">
        <h1 className="admin-title">댓글 관리 대시보드</h1>
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{total.toLocaleString()}</span>
            <span className="stat-label">총 댓글</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{comments.length}</span>
            <span className="stat-label">현재 페이지</span>
          </div>
        </div>
      </div>

      <div className="admin-controls">
        <div className="search-container">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchTerm); }} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="사용자 이메일, 댓글 내용, 곡 제목으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                🔍 검색
              </button>
              {searchTerm && (
                <button type="button" onClick={clearSearch} className="clear-btn">
                  ✕ 초기화
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="table-container">
        {loading && (
          <div className="table-loading-overlay">
            <div className="mini-spinner"></div>
          </div>
        )}
        
        <div className="table-wrapper">
          <table className="comment-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>곡 정보</th>
                <th>사용자</th>
                <th>댓글 내용</th>
                <th>작성일시</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(comment => (
                <tr key={comment.id} className={comment.status === 'reported' ? 'reported-comment' : ''}>
                  <td className="comment-id">#{comment.id}</td>
                  <td className="song-info">
                    <div className="song-details">
                      <div className="song-title">{comment.songTitle || `곡 ID: ${comment.songId}`}</div>
                      <div className="artist-name">{comment.artistName || 'Unknown Artist'}</div>
                    </div>
                  </td>
                  <td className="user-info">
                    <div className="user-email">{comment.userEmail}</div>
                  </td>
                  <td className="comment-content">
                    <div className="content-text" title={comment.content}>
                      {comment.content.length > 80 ? `${comment.content.slice(0, 80)}...` : comment.content}
                    </div>
                    {comment.likes > 0 && (
                      <div className="comment-likes">❤️ {comment.likes}</div>
                    )}
                  </td>
                  <td className="comment-date">
                    <div className="date-text">
                      {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="time-text">
                      {new Date(comment.createdAt).toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="comment-status">
                    <span className={`status-badge ${comment.status}`}>
                      {comment.status === 'reported' ? '신고됨' : '정상'}
                    </span>
                  </td>
                  <td className="comment-actions">
                    <button 
                      onClick={() => handleDelete(comment.id)} 
                      className="delete-btn"
                      disabled={loading}
                    >
                      🗑️ 삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {comments.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">💭</div>
            <p className="empty-text">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 댓글이 없습니다.'}
            </p>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="pagination-container">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / size)}
            onPageChange={handlePageChange}
          />
          <div className="pagination-info">
            총 {total.toLocaleString()}개 중 {((page - 1) * size) + 1}-{Math.min(page * size, total)}번째 표시
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentManagement;