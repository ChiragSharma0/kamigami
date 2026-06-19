import React, { useState, useEffect, useRef } from 'react';
import { Upload, Search, Loader2, Image as ImageIcon, Video, Trash2, Copy, Eye, Plus, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MediaGallery = () => {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/media', {
        params: { limit: 100, search: searchTerm }
      });
      setMedia(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load media assets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedia();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('folder', 'gallery');

    setIsUploading(true);
    try {
      await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Media assets uploaded successfully');
      fetchMedia();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload media assets');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this media asset? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/media/${id}`);
      toast.success('Media asset deleted');
      fetchMedia();
    } catch (err) {
      toast.error('Failed to delete media asset');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Asset URL copied to clipboard');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Media & Asset Sanctum</h1>
          <p className="text-sm text-slate-500 mt-1">Upload, search, copy URLs, and organize all digital assets for the storefront and drops.</p>
        </div>
        
        <div>
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-[0.98]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Assets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets by file name or alternative tags..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 min-h-[40vh] flex items-center justify-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Unlocking asset vaults...</span>
          </div>
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 min-h-[40vh] flex flex-col items-center justify-center text-slate-400 space-y-4 shadow-sm p-6">
          <ImageIcon className="w-16 h-16 opacity-20 text-slate-500" />
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-slate-700">No media assets found</p>
            <p className="text-xs text-slate-400 max-w-xs">Upload new JPG, PNG, WEBP, or GIF files to start building your digital storefront archives.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
            >
              {item.type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt={item.altText || item.fileName} className="w-full h-full object-cover" />
              )}

              {/* Hover Actions Panel */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-3">
                {/* Top: Metadata */}
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1">
                    {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    {item.type}
                  </span>
                </div>

                {/* Bottom: Action Buttons */}
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setPreviewImage(item)}
                    className="p-2 bg-slate-900/85 hover:bg-slate-800 text-white rounded-lg transition-all"
                    title="Preview Media"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="p-2 bg-slate-900/85 hover:bg-slate-800 text-white rounded-lg transition-all"
                    title="Copy URL Address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-all"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Screen Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)} />
          <div className="relative max-w-4xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition z-10"
            >
              <ArrowLeft className="w-4 h-4 transform rotate-180" />
            </button>
            <div className="p-2">
              {previewImage.type === 'video' ? (
                <video src={previewImage.url} controls className="max-w-full max-h-[75vh] object-contain rounded-lg" autoPlay />
              ) : (
                <img src={previewImage.url} alt="Preview" className="max-w-full max-h-[75vh] object-contain rounded-lg" />
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="truncate max-w-md">
                <p className="text-sm font-bold text-slate-800 truncate">{previewImage.fileName}</p>
                <p className="text-xxs font-bold text-slate-400 truncate uppercase mt-0.5">{previewImage.url}</p>
              </div>
              <button
                onClick={() => copyUrl(previewImage.url)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
