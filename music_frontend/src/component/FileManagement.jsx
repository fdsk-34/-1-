import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoadingToast from '../component/LoadingToast';
import axios from 'axios';
import '../styles/FileManagement.css';

// 모의 데이터
const mockFiles = [
  { id: 'file1', name: 'song1.mp3', size: 5242880, type: 'audio/mpeg', uploadedAt: '2025-08-01T10:00:00Z', url: '/assets/song1.mp3' },
  { id: 'file2', name: 'song2.wav', size: 10485760, type: 'audio/wav', uploadedAt: '2025-08-02T12:00:00Z', url: '/assets/song2.wav' },
];

const FileManagement = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedFiles = localStorage.getItem('uploadedFiles');
    if (storedFiles) {
      setFiles(JSON.parse(storedFiles));
    } else {
      setFiles(mockFiles);
      localStorage.setItem('uploadedFiles', JSON.stringify(mockFiles));
    }
    setLoading(false);

    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/files`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
        });
        setFiles(res.data);
        localStorage.setItem('uploadedFiles', JSON.stringify(res.data));
      } catch (err) {
        setError(err.message || '파일 목록을 불러오는 데 실패했습니다. 로컬 데이터를 사용합니다.');
        const stored = localStorage.getItem('uploadedFiles');
        if (stored) setFiles(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const handleFileSelect = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    if (!['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac'].includes(uploadedFile.type)) {
      setError('지원되는 파일 형식: MP3, WAV, FLAC');
      setSelectedFile(null);
      return;
    }

    setSelectedFile({
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type,
      file: uploadedFile,
    });
    setError(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);

    let updatedFiles;
    let newFile;

    try {
      // ⭐ 1. API 호출을 먼저 시도 ⭐
      const formData = new FormData();
      formData.append('file', selectedFile.file);
      const res = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      newFile = res.data;
      setError(null);
    } catch (err) {
      // ⭐ 2. API 호출 실패 시 로컬 모의 데이터로 대체 ⭐
      setError(err.message || '파일 업로드에 실패했습니다. 로컬에 저장합니다.');
      newFile = {
        id: `file${files.length + 1}`,
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        uploadedAt: new Date().toISOString(),
        url: `/assets/${selectedFile.name}`,
      };
    }

    // ⭐ 3. API 성공 또는 실패와 관계없이 로컬 상태 및 저장소 업데이트 ⭐
    updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
    setSelectedFile(null);
    setLoading(false);
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleDownload = (fileId) => {
    if (!user || user.role !== 'ADMIN') {
      setError('관리자만 다운로드할 수 있습니다.');
      return;
    }

    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // ⭐ 1. API 호출을 먼저 시도 ⭐
    axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/files/download/${fileId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      responseType: 'blob',
    })
      .then(response => {
        // API 호출 성공 시: 올바른 MIME 타입으로 Blob 생성 및 다운로드
        const fileBlob = new Blob([response.data], { type: file.type });
        const url = window.URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        
        link.href = url;
        link.setAttribute('download', file.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
        setError(null);
      })
      .catch(err => {
        // ⭐ 2. API 호출 실패 시 로컬 데이터 다운로드로 대체 ⭐
        setError(err.message || '파일 다운로드에 실패했습니다. 로컬 데이터를 시도합니다.');
        
        const stored = localStorage.getItem('uploadedFiles');
        if (stored) {
          const storedFiles = JSON.parse(stored);
          const localFile = storedFiles.find(f => f.id === fileId);
          
          if (localFile) {
            const link = document.createElement('a');
            link.href = localFile.url;
            link.download = localFile.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            setError('로컬에서도 파일을 찾을 수 없습니다.');
          }
        }
      });
  };

  const handleDelete = (fileId) => {
    if (window.confirm('이 파일을 삭제하시겠습니까?')) {
      const updatedFiles = files.filter(file => file.id !== fileId);
      setFiles(updatedFiles);
      localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));

      axios.delete(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/files/${fileId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      })
        .catch(err => {
          setError(err.message || '파일 삭제에 실패했습니다. 로컬 데이터를 업데이트했습니다.');
        });
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="file-management-container">
      <h2 className="file-management-title">파일 관리</h2>
      <LoadingToast isLoading={loading} onDismiss={() => setLoading(false)} />
      {error && <p className="file-management-error">{error}</p>}

      <div className="file-management-controls">
        <input
          type="text"
          placeholder="파일명으로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="file-management-search"
        />
        <label className="file-management-upload-label">
          파일 선택
          <input
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/flac"
            onChange={handleFileSelect}
            className="file-management-upload-input"
          />
        </label>
      </div>

      {selectedFile && (
        <div className="file-management-preview">
          <h3>파일 미리보기</h3>
          <p>파일명: {selectedFile.name}</p>
          <p>크기: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <p>형식: {selectedFile.type}</p>
          <div className="file-management-preview-buttons">
            <button
              onClick={handleFileUpload}
              className="file-management-btn file-management-btn-upload"
            >
              업로드
            </button>
            <button
              onClick={handleCancelUpload}
              className="file-management-btn file-management-btn-cancel"
            >
              취소
            </button>
          </div>
        </div>
      )}

      <table className="file-management-table">
        <thead>
          <tr>
            <th>파일명</th>
            <th>크기</th>
            <th>형식</th>
            <th>업로드 날짜</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {filteredFiles.length === 0 ? (
            <tr>
              <td colSpan="5" className="file-management-empty">파일 없음</td>
            </tr>
          ) : (
            filteredFiles.map(file => (
              <tr key={file.id}>
                <td>{file.name}</td>
                <td>{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                <td>{file.type}</td>
                <td>{new Date(file.uploadedAt).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => handleDownload(file.id)}
                    className="file-management-btn file-management-btn-download"
                    disabled={user?.role !== 'ADMIN'}
                  >
                    다운로드
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="file-management-btn file-management-btn-delete"
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

export default FileManagement;