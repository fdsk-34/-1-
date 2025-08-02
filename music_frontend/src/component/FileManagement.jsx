import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import LoadingToast from './LoadingToast';
import axios from 'axios';
import '../styles/FileManagement.css';
import { toast } from 'react-toastify';

// 모의 데이터
const mockFiles = [
  { id: 'file1', name: 'song1.mp3', size: 5242880, type: 'audio/mpeg', uploadedAt: '2025-08-01T10:00:00Z', url: '/assets/song1.mp3' },
  { id: 'file2', name: 'song2.wav', size: 10485760, type: 'audio/wav', uploadedAt: '2025-08-02T12:00:00Z', url: '/assets/song2.wav' },
];

const FileManagement = () => {
  const { user } = useContext(AuthContext);
  const { addSongToPlaylist } = useContext(MusicPlayerContext); // MusicPlayerContext 추가
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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

    const acceptedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac'];
    if (!acceptedTypes.includes(uploadedFile.type)) {
      setError('지원되는 파일 형식: MP3, WAV, FLAC');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    const newPreviewUrl = URL.createObjectURL(uploadedFile);
    setSelectedFile({
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type,
      file: uploadedFile,
    });
    setPreviewUrl(newPreviewUrl);
    setError(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);

    let updatedFiles;
    let newFile;

    try {
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
      toast.success('파일이 성공적으로 업로드되었습니다.');
    } catch (err) {
      setError(err.message || '파일 업로드에 실패했습니다. 로컬에 저장합니다.');
      newFile = {
        id: `file${files.length + 1}`,
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(selectedFile.file),
      };
      toast.info('파일이 로컬에 임시 저장되었습니다.');
    }

    updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setLoading(false);
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
  };

  const handleDownload = (fileId) => {
    if (!user || user.role !== 'ADMIN') {
      setError('관리자만 다운로드할 수 있습니다.');
      return;
    }

    const file = files.find(f => f.id === fileId);
    if (!file) return;

    axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/files/download/${fileId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      responseType: 'blob',
    })
      .then(response => {
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
        toast.success(`${file.name} 다운로드 성공!`);
      })
      .catch(err => {
        setError(err.message || '파일 다운로드에 실패했습니다. 로컬 데이터를 시도합니다.');
        toast.error('다운로드 실패, 로컬 데이터로 대체합니다.');
        
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
            toast.success(`로컬 파일 ${localFile.name} 다운로드 성공!`);
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
      toast.success('파일이 로컬에서 삭제되었습니다.');

      axios.delete(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/files/${fileId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      })
        .then(() => toast.success('파일이 서버에서 삭제되었습니다.'))
        .catch(err => {
          setError(err.message || '파일 삭제에 실패했습니다. 로컬 데이터를 업데이트했습니다.');
          toast.error('서버 파일 삭제 실패.');
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
          {previewUrl && (
            <audio controls src={previewUrl} className="file-management-audio-preview">
              브라우저가 오디오 미리보기를 지원하지 않습니다.
            </audio>
          )}
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
                  <button
                    onClick={() => addSongToPlaylist(file)}
                    className="file-management-btn file-management-btn-add-playlist"
                  >
                    + 재생목록에 추가
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