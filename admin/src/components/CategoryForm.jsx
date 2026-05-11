import React, { useState } from 'react';
import { Loader2, Layers } from 'lucide-react';

const CategoryForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Category Name</label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            placeholder="e.g. Streetwear"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Slug</label>
          <input
            type="text"
            name="slug"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            placeholder="e.g. streetwear"
            value={formData.slug}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Description</label>
        <textarea
          name="description"
          rows="3"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          placeholder="What kind of products belong here?"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          checked={formData.isActive}
          onChange={handleChange}
        />
        <label htmlFor="isActive" className="text-sm font-bold text-slate-700">
          Make this category active immediately
        </label>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Layers className="w-5 h-5" />
              <span>Create Category</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
