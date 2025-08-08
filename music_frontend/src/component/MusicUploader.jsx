
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUpload } from 'react-icons/fa';
import axios from 'axios';
import '../styles/MusicUploader.css';

const MusicUploader = () => {
  const { user } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // 파일 유형 및 확장자 검증
    const validAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac'];
    const validExtensions = ['.mp3', '.wav', '.flac'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validAudioTypes.includes(file.type) || !validExtensions.includes(extension)) {
      window.showToast('지원되는 파일 형식: MP3, WAV, FLAC', 'error');
      setSelectedFile(null);
      return;
    }

    // 파일 크기 제한 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      window.showToast('파일 크기는 50MB를 초과할 수 없습니다.', 'error');
      setSelectedFile(null);
      return;
    }

    setSelectedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      fileData: file,
      url: URL.createObjectURL(file),
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      window.showToast('업로드할 파일을 선택해주세요.', 'error');
      return;
    }

    if (!user?.token) {
      window.showToast('로그인이 필요합니다.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile.fileData);

    try {
      const response = await axios.post('http://localhost:8080/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      window.showToast(`${selectedFile.name}이(가) 성공적으로 업로드되었습니다.`, 'success');
      setSelectedFile(null);
      setUploadProgress(0);
      return response.data.url;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      window.showToast(
        error.response?.data?.error || '파일 업로드에 실패했습니다.',
        'error'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
    }
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="music-uploader-container">
      <h2 className="music-uploader-title">음악 파일 업로드</h2>
      <div className="music-uploader-controls">
        <label className="music-uploader-label">
          오디오 파일 선택 (최대 50MB, MP3/WAV/FLAC)
          <input
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/flac"
            onChange={handleFileChange}
            className="music-uploader-input"
            disabled={isUploading}
            aria-label="오디오 파일 선택"
          />
        </label>
        {selectedFile && (
          <div className="music-uploader-preview">
            <p><strong>파일명:</strong> {selectedFile.name}</p>
            <p><strong>크기:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>형식:</strong> {selectedFile.type}</p>
            {isUploading && (
              <div className="upload-progress">
                <progress value={uploadProgress} max="100" />
                <span>{uploadProgress}%</span>
              </div>
            )}
            <div className="music-uploader-buttons">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="music-uploader-btn music-uploader-btn-upload"
                aria-label="파일 업로드"
              >
                <FaUpload /> {isUploading ? '업로드 중...' : '업로드'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="music-uploader-btn music-uploader-btn-cancel"
                aria-label="업로드 취소"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicUploader;
