// src/api/playlistApi.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const createPlaylist = async (name, songIds, isPublic) => {
  const res = await axios.post(
    `${API_URL}/api/playlists`,
    { name, songIds, isPublic },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const fetchMyPlaylists = async () => {
  const res = await axios.get(`${API_URL}/api/playlists`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchPlaylistDetails = async (playlistId) => {
  const res = await axios.get(`${API_URL}/api/playlists/${playlistId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const updatePlaylist = async (playlistId, name, songIds, isPublic) => {
  const res = await axios.put(
    `${API_URL}/api/playlists/${playlistId}`,
    { name, songIds, isPublic },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const deletePlaylist = async (playlistId) => {
  const res = await axios.delete(`${API_URL}/api/playlists/${playlistId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const togglePlaylistVisibility = async (playlistId, isPublic) => {
  const res = await axios.put(
    `${API_URL}/api/playlists/${playlistId}/toggle-visibility`,
    { isPublic },
    { headers: getAuthHeaders() }
  );
  return res.data;
};