import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Search, Loader2, Image as ImageIcon, Video, Trash2, Check, Copy } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MediaGalleryModal = ({ isOpen, onClose, onSelect, multiple = false, allowedTypes = ['image', 'video'] }) => {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    } else {
      setSelectedIds([]);
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/media', {
        params: { limit: 100, search: searchTerm }
      });
      setMedia(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load media');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) fetchMedia();
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
      toast.success('Media uploaded successfully');
      fetchMedia();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload media');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleSelection = (item) => {
    if (multiple) {
      setSelectedIds(prev => 
        prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
      );
    } else {
      setSelectedIds([item.id]);
    }
  };

  const handleConfirm = () => {
    const selectedItems = media.filter(m => selectedIds.includes(m.id));
    onSelect(multiple ? selectedItems : selectedItems[0]);
    onClose();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;
    try {
      await api.delete(`/admin/media/${id}`);
      toast.success('Media deleted');
      fetchMedia();
    } catch (err) {
      toast.error('Failed to delete media');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Media Gallery</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select or upload files</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or alt text..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
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
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-70"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload Files
            </button>
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : media.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <ImageIcon className="w-16 h-16 opacity-20" />
              <p className="text-sm font-bold">No media files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {media.map(item => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelection(item)}
                    className={`group relative aspect-square rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${isSelected ? 'border-primary-500 shadow-md shadow-primary-500/20 scale-[0.98]' : 'border-transparent hover:border-slate-300 bg-white shadow-sm'}`}
                  >
                    {item.type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt={item.altText || item.fileName} className="w-full h-full object-cover" />
                    )}
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-all ${isSelected ? 'bg-primary-500/10' : 'bg-slate-900/0 group-hover:bg-slate-900/40'}`}>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold uppercase rounded-md flex items-center gap-1">
                          {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                          {item.type}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}
                          className="p-1.5 bg-slate-900/80 backdrop-blur-sm text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                          className="p-1.5 bg-red-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">
            {selectedIds.length} file{selectedIds.length !== 1 && 's'} selected
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0 && !multiple}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
            >
              Insert Media
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaGalleryModal;
