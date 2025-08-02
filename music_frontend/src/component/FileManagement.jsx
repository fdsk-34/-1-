import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { FaUpload, FaDownload, FaTrash, FaPlus } from 'react-icons/fa';
import '../styles/FileManagement.css';
import noSongImage from '../assets/default-cover.jpg';

// IndexedDB 헬퍼 함수
const dbName = 'musicPlayerDB';
const storeName = 'uploadedFiles';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const saveFileToDB = async (fileObj) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(fileObj);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

const getAllFilesFromDB = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const deleteFileFromDB = async (fileId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(fileId);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

const FileManagement = () => {
  const { user } = useContext(AuthContext);
  const { addSongToPlaylist } = useContext(MusicPlayerContext);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        window.showToast('파일 목록을 불러오는 중...', 'info');
        const files = await getAllFilesFromDB();
        setUploadedFiles(files);
        if (files.length > 0) {
          window.showToast(`${files.length}개의 파일을 불러왔습니다.`, 'success');
        } else {
          window.showToast('저장된 파일이 없습니다.', 'info');
        }
      } catch (error) {
        console.error('Failed to load files from IndexedDB:', error);
        window.showToast('파일 목록 로드에 실패했습니다.', 'error');
      }
    };
    loadFiles();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No audio file selected');
      setSelectedFile(null);
      return;
    }

    const validAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac'];
    const validExtensions = ['.mp3', '.wav', '.flac'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validAudioTypes.includes(file.type) || !validExtensions.includes(extension)) {
      window.showToast('지원되는 파일 형식: MP3, WAV, FLAC', 'error');
      console.log('Invalid audio file:', { type: file.type, extension });
      setSelectedFile(null);
      e.target.value = ''; // 파일 입력 초기화
      return;
    }

    // 파일 크기 체크 (50MB 제한)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      window.showToast('파일 크기는 50MB 이하여야 합니다.', 'error');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    const fileData = {
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    };
    setSelectedFile(fileData);
    window.showToast('오디오 파일이 선택되었습니다.', 'success');
    console.log('Selected audio file:', fileData);
  };

  const handleCoverChange = (e) => {
    const cover = e.target.files[0];
    if (!cover) {
      console.log('No cover image selected');
      setSelectedCover(null);
      return;
    }

    const validImageTypes = ['image/jpeg', 'image/png'];
    const validImageExtensions = ['.jpg', '.jpeg', '.png'];
    const extension = cover.name.toLowerCase().slice(cover.name.lastIndexOf('.'));
    if (!validImageTypes.includes(cover.type) || !validImageExtensions.includes(extension)) {
      window.showToast('지원되는 이미지 형식: JPG, PNG', 'error');
      console.log('Invalid cover image:', { type: cover.type, extension });
      setSelectedCover(null);
      e.target.value = '';
      return;
    }

    // 이미지 크기 체크 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (cover.size > maxSize) {
      window.showToast('이미지 크기는 5MB 이하여야 합니다.', 'error');
      setSelectedCover(null);
      e.target.value = '';
      return;
    }

    const coverData = {
      file: cover,
      url: URL.createObjectURL(cover),
    };
    setSelectedCover(coverData);
    window.showToast('앨범 커버가 선택되었습니다.', 'success');
    console.log('Selected cover image:', coverData);
  };

  const handleUpload = async () => {
    if (!user) {
      window.showToast('로그인이 필요합니다.', 'error');
      console.log('Upload failed: User not logged in');
      setSelectedFile(null);
      setSelectedCover(null);
      return;
    }

    if (!selectedFile) {
      window.showToast('업로드할 오디오 파일을 선택해주세요.', 'error');
      console.log('Upload failed: No audio file selected');
      return;
    }

    window.showToast('파일을 업로드하는 중...', 'info');

    const songId = `admin-upload-${Date.now()}`;
    const newFile = {
      id: songId,
      name: selectedFile.name,
      artist: '관리자 업로드',
      coverUrl: selectedCover ? selectedCover.url : noSongImage,
      url: selectedFile.url,
      isLocal: true,
      fileData: selectedFile.file,
      coverFile: selectedCover ? selectedCover.file : null,
      size: selectedFile.size,
      uploadedAt: new Date().toISOString(),
    };

    try {
      await saveFileToDB(newFile);
      setUploadedFiles((prevFiles) => [...prevFiles, newFile]);
      window.showToast(`${selectedFile.name} 파일이 성공적으로 업로드되었습니다.`, 'success');
      console.log('Upload successful:', newFile);
      setSelectedFile(null);
      setSelectedCover(null);
      // 파일 입력 초기화
      document.getElementById('audio-upload').value = '';
      document.getElementById('cover-upload').value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      try {
        await saveFileToDB(newFile);
        setUploadedFiles((prevFiles) => [...prevFiles, newFile]);
        window.showToast(`${selectedFile.name} 파일이 로컬에 저장되었습니다.`, 'success');
        console.log('Local upload successful:', newFile);
      } catch (localError) {
        window.showToast('파일 업로드 및 로컬 저장에 실패했습니다.', 'error');
        console.error('Local upload failed:', localError);
      }
      setSelectedFile(null);
      setSelectedCover(null);
      document.getElementById('audio-upload').value = '';
      document.getElementById('cover-upload').value = '';
    }
  };

  const handleCancelUpload = () => {
    if (selectedFile) URL.revokeObjectURL(selectedFile.url);
    if (selectedCover) URL.revokeObjectURL(selectedCover.url);
    setSelectedFile(null);
    setSelectedCover(null);
    document.getElementById('audio-upload').value = '';
    document.getElementById('cover-upload').value = '';
    window.showToast('업로드가 취소되었습니다.', 'info');
    console.log('Upload cancelled');
  };

  const handleDownload = (file) => {
    if (!user || user.role !== 'ADMIN') {
      window.showToast('관리자만 다운로드할 수 있습니다.', 'error');
      console.log('Download failed: Not admin');
      return;
    }

    if (file.fileData) {
      try {
        const url = URL.createObjectURL(file.fileData);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        window.showToast(`${file.name} 다운로드를 시작합니다.`, 'success');
        console.log('Download started:', file.name);
      } catch (error) {
        window.showToast('다운로드 중 오류가 발생했습니다.', 'error');
        console.error('Download error:', error);
      }
    } else {
      window.showToast('파일 데이터를 찾을 수 없습니다.', 'error');
      console.log('Download failed: No file data');
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`"${fileName}" 파일을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteFileFromDB(fileId);
      setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      window.showToast(`${fileName} 파일이 삭제되었습니다.`, 'success');
      console.log('File deleted:', fileId);
    } catch (error) {
      window.showToast('파일 삭제에 실패했습니다.', 'error');
      console.error('IndexedDB delete failed:', error);
    }
  };

  const handleAddToPlaylist = (file) => {
    try {
      const song = {
        id: file.id,
        name: file.name,
        artist: file.artist,
        coverUrl: file.coverUrl,
        url: file.url,
        isLocal: true,
      };
      addSongToPlaylist(song);
      window.showToast(`${file.name}이 플레이리스트에 추가되었습니다.`, 'success');
      console.log('Added to playlist:', file.name);
    } catch (error) {
      window.showToast('플레이리스트 추가에 실패했습니다.', 'error');
      console.error('Add to playlist failed:', error);
    }
  };

  return (
    <div className="file-management-container">
      <h2 className="file-management-title">파일 관리자 페이지</h2>
      <div className="file-management-controls">
        <label className="file-management-label">
          오디오 파일 선택 (최대 50MB)
          <input
            type="file"
            id="audio-upload"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/flac"
            onChange={handleFileChange}
            className="file-management-upload-input"
          />
        </label>
        <label className="file-management-label">
          앨범 커버 선택 (선택 사항, 최대 5MB)
          <input
            type="file"
            id="cover-upload"
            accept="image/jpeg,image/png"
            onChange={handleCoverChange}
            className="file-management-upload-input"
          />
        </label>
        <button onClick={handleUpload} className="file-management-btn file-management-btn-upload">
          <FaUpload /> 업로드
        </button>
      </div>

      {selectedFile && (
        <div className="file-management-preview">
          <h3 className="file-management-preview-title">파일 미리보기</h3>
          <div className="file-management-preview-content">
            <img
              src={selectedCover ? selectedCover.url : noSongImage}
              alt="앨범 커버"
              className="file-management-preview-cover"
            />
            <div className="file-management-preview-details">
              <p><strong>파일명:</strong> {selectedFile.name}</p>
              <p><strong>크기:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>형식:</strong> {selectedFile.type}</p>
              <audio controls src={selectedFile.url} className="file-management-preview-audio" />
            </div>
          </div>
          <div className="file-management-preview-buttons">
            <button
              onClick={handleUpload}
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

      <div className="file-management-list">
        {uploadedFiles.length > 0 ? (
          <table className="file-management-table">
            <thead>
              <tr>
                <th>앨범 커버</th>
                <th>파일명</th>
                <th>아티스트</th>
                <th>크기</th>
                <th>업로드 날짜</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file) => (
                <tr key={file.id}>
                  <td>
                    <img
                      src={file.coverUrl}
                      alt="앨범 커버"
                      className="file-management-table-cover"
                    />
                  </td>
                  <td>{file.name}</td>
                  <td>{file.artist}</td>
                  <td>{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                  <td>{new Date(file.uploadedAt).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => handleDownload(file)}
                      className="file-management-btn file-management-btn-download"
                      disabled={user?.role !== 'ADMIN'}
                      title={user?.role !== 'ADMIN' ? '관리자만 다운로드 가능' : ''}
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={() => handleAddToPlaylist(file)}
                      className="file-management-btn file-management-btn-add"
                    >
                      <FaPlus />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id, file.name)}
                      className="file-management-btn file-management-btn-delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="file-management-empty">업로드된 파일이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default FileManagement;