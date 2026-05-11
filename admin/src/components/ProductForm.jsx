import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Loader2,
  Package,
  Layers,
  Image as ImageIcon,
  ChevronDown,
  DollarSign,
  Barcode,
  Hash,
  X,
  PlusCircle,
  Tag,
  Eye,
  Settings,
  Palette,
  Maximize2,
  Zap,
  Flame
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import MediaGalleryModal from './MediaGalleryModal';

const Type = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'FREE SIZE', 'ONE SIZE'];
const COMMON_COLORS = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Yellow', hex: '#FFFF00' }
];

const BulkGenerator = ({ onGenerate, baseSku, basePrice }) => {
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [customColor, setCustomColor] = useState({ name: '', hex: '#000000', active: false });

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev =>
      prev.find(c => c.name === color.name)
        ? prev.filter(c => c.name !== color.name)
        : [...prev, color]
    );
  };

  const handleGenerate = () => {
    if (selectedSizes.length === 0) {
      toast.error('Select at least one size');
      return;
    }

    let colorsToUse = [...selectedColors];
    if (customColor.active) {
      if (!customColor.name) {
        toast.error('Custom color needs a name');
        return;
      }
      colorsToUse.push({ name: customColor.name, hex: customColor.hex });
    }

    if (colorsToUse.length === 0) {
      toast.error('Select at least one color or define a custom one');
      return;
    }

    onGenerate(selectedSizes, colorsToUse);
    setSelectedSizes([]);
    setSelectedColors([]);
    setCustomColor({ name: '', hex: '#000000', active: false });
  };

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl shadow-slate-300">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xl font-black tracking-tight">Bulk SKU Generator</h4>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Generate all combinations instantly</p>
        </div>
        <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">1. Select Sizes</label>
          <div className="flex flex-wrap gap-2">
            {STANDARD_SIZES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${selectedSizes.includes(s) ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">2. Select Colors</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_COLORS.map(c => (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleColor(c)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${selectedColors.find(sc => sc.name === c.name) ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
              >
                <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">3. Custom Definition</label>
            <button
              type="button"
              onClick={() => setCustomColor(prev => ({ ...prev, active: !prev.active }))}
              className={`text-[8px] font-black uppercase px-2 py-1 rounded-md transition-all ${customColor.active ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/40'}`}
            >
              {customColor.active ? 'Active' : 'Enable'}
            </button>
          </div>

          {customColor.active && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                placeholder="Color Name"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-white/30"
                value={customColor.name}
                onChange={(e) => setCustomColor(prev => ({ ...prev, name: e.target.value }))}
              />
              <div className="relative">
                <input
                  type="text"
                  placeholder="#HEX"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono font-bold text-white outline-none focus:border-white/30"
                  value={customColor.hex}
                  onChange={(e) => setCustomColor(prev => ({ ...prev, hex: e.target.value }))}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: customColor.hex }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Generate {selectedSizes.length * selectedColors.length || 0} Variations
      </button>
    </div>
  );
};

const ProductForm = ({ onSubmit, isLoading, initialData }) => {
  const [categories, setCategories] = useState([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    sku: initialData?.sku || '',
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || '',
    categoryId: initialData?.categoryId || '',
    status: initialData?.status || 'PUBLISHED',
    isDrop: initialData?.isDrop || false,
    media: initialData?.media?.map(m => m.media) || [],
    variants: initialData?.variants || [
      { sku: '', attributes: { size: 'M', color: 'Ebony', colorHex: '#28282B' }, price: '', initialStock: 0 }
    ]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        sku: initialData.sku || '',
        description: initialData.description || '',
        basePrice: initialData.basePrice || '',
        categoryId: initialData.categoryId || '',
        status: initialData.status || 'PUBLISHED',
        isDrop: initialData.isDrop || false,
        media: initialData.media?.map(m => m.media) || [],
        variants: initialData.variants && initialData.variants.length > 0 ? initialData.variants.map(v => ({
          ...v,
          price: v.price || '',
          initialStock: v.inventory?.stockTotal || 0,
          attributes: {
            size: v.attributes?.size || 'M',
            color: v.attributes?.color || 'Ebony',
            colorHex: v.attributes?.colorHex || '#28282B'
          }
        })) : [
          { sku: '', attributes: { size: 'M', color: 'Ebony', colorHex: '#28282B' }, price: '', initialStock: 0 }
        ]
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsFetchingCategories(true);
      try {
        const response = await api.get('/admin/categories');
        setCategories(response.data?.data?.categories || response.data?.categories || response.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setIsFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const formatSlug = (val) => val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const formatSKU = (val) => val.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9-]/g, '');

  const generateVariantSKU = (baseSku, size, color) => {
    if (!baseSku) return '';
    const cleanSize = (size || '').toUpperCase();
    const cleanColor = (color || '').toUpperCase().substring(0, 3);
    return `${formatSKU(baseSku)}-${cleanSize}-${cleanColor}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'slug') finalValue = formatSlug(value);
    if (name === 'sku') {
      finalValue = formatSKU(value);
      // Auto-update all variant SKUs if base SKU changes
      setFormData(prev => {
        const newVariants = prev.variants.map(v => ({
          ...v,
          sku: generateVariantSKU(finalValue, v.attributes.size, v.attributes.color)
        }));
        return { ...prev, sku: finalValue, variants: newVariants };
      });
      return;
    }

    if (name === 'name' && !initialData) {
      const slug = formatSlug(value);
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: slug
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }

    if (errors[name]) setErrors(prev => {
      const newErrs = { ...prev };
      delete newErrs[name];
      return newErrs;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'URL slug is required';
    if (!formData.sku.trim()) newErrors.sku = 'Base SKU is required';
    if (!formData.basePrice || isNaN(formData.basePrice)) newErrors.basePrice = 'Valid price required';
    if (!formData.categoryId) newErrors.categoryId = 'Select a category';

    formData.variants.forEach((v, i) => {
      if (!v.sku.trim()) newErrors[`variant_${i}_sku`] = 'Required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleMediaSelect = (selectedMedia) => {
    setFormData(prev => {
      // Append only new ones
      const existingIds = prev.media.map(m => m.id);
      const newMedia = selectedMedia.filter(m => !existingIds.includes(m.id));
      return { ...prev, media: [...prev.media, ...newMedia] };
    });
  };

  const removeMedia = (id) => {
    setFormData(prev => ({ ...prev, media: prev.media.filter(m => m.id !== id) }));
  };

  // Variant Helpers
  const handleVariantChange = (index, field, value, isAttribute = false) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      const variant = { ...newVariants[index] };

      if (isAttribute) {
        const newAttributes = {
          ...(variant.attributes || {}),
          [field]: value
        };

        // If color selection, maybe auto-set hex if from presets
        if (field === 'color') {
          const preset = COMMON_COLORS.find(c => c.name === value);
          if (preset) newAttributes.colorHex = preset.hex;
        }

        variant.attributes = newAttributes;
        // Auto-generate SKU based on new attributes
        variant.sku = generateVariantSKU(prev.sku, newAttributes.size, newAttributes.color);
      } else {
        variant[field] = value;
      }

      newVariants[index] = variant;
      return { ...prev, variants: newVariants };
    });
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sku: generateVariantSKU(prev.sku, 'M', 'Ebony'),
          attributes: { size: 'M', color: 'Ebony', colorHex: '#28282B' },
          price: '',
          initialStock: 0
        }
      ]
    }));
    toast.success('Added variant with auto-SKU');
  };

  const generateBulkVariants = (sizes, colors) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      let addedCount = 0;

      sizes.forEach(size => {
        colors.forEach(color => {
          // Check if already exists
          const exists = newVariants.find(v =>
            v.attributes.size === size && v.attributes.color === color.name
          );

          if (!exists) {
            newVariants.push({
              sku: generateVariantSKU(prev.sku, size, color.name),
              attributes: {
                size: size,
                color: color.name,
                colorHex: color.hex
              },
              price: '',
              initialStock: 0
            });
            addedCount++;
          }
        });
      });

      // Filter out the initial empty variant if it's the only one and untouched
      const finalVariants = newVariants.filter(v => {
        if (newVariants.length > 1 && v.sku === '' && v.initialStock === 0) return false;
        return true;
      });

      toast.success(`Generated ${addedCount} new combinations`);
      return { ...prev, variants: finalVariants };
    });
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please check required fields');
      return;
    }

    const payload = {
      ...formData,
      basePrice: parseFloat(formData.basePrice),
      mediaIds: formData.media.map(m => m.id),
      variants: formData.variants.map(v => ({
        ...v,
        sku: v.sku || generateVariantSKU(formData.sku, v.attributes.size, v.attributes.color),
        price: v.price ? parseFloat(v.price) : parseFloat(formData.basePrice),
        initialStock: parseInt(v.initialStock) || 0,
        attributes: v.attributes
      }))
    };

    onSubmit(payload);
  };

  const [isBulkOpen, setIsBulkOpen] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* 1. Core Identity */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Product Details</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">General information and identity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Product Name</label>
            <input
              type="text"
              name="name"
              className={`w-full px-6 py-4 bg-slate-50 border-2 ${errors.name ? 'border-red-200' : 'border-slate-100'} rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-lg`}
              placeholder="e.g. Premium Cotton Oversized Tee"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase ml-2">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">URL Slug</label>
            <input
              type="text"
              name="slug"
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-sm"
              value={formData.slug}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Drop Only Product?</label>
            <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isDrop: !prev.isDrop }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isDrop ? 'bg-primary-500' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isDrop ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-xs font-black uppercase tracking-widest ${formData.isDrop ? 'text-primary-600' : 'text-slate-400'}`}>
                {formData.isDrop ? 'Active' : 'Disabled'}
              </span>
              {formData.isDrop && <Flame className="w-4 h-4 text-primary-500 animate-pulse ml-auto" />}
            </div>
            <p className="text-[8px] text-slate-400 font-bold uppercase ml-1">Hidden from main store catalog</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Base SKU</label>
            <input
              type="text"
              name="sku"
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-sm uppercase"
              value={formData.sku}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
            <select
              name="categoryId"
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-sm"
              value={formData.categoryId}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Base Price</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                name="basePrice"
                className="w-full pl-10 pr-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-sm"
                value={formData.basePrice}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</label>
          <textarea
            name="description"
            rows="5"
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-primary-500 font-medium text-sm leading-relaxed"
            placeholder="Product story..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* 2. Media Section */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Media Assets</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Global product gallery</p>
            </div>
          </div>
          <button type="button" onClick={() => setIsGalleryOpen(true)} className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Media
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {formData.media.map((item, idx) => (
            <div key={item.id || idx} className="relative aspect-square rounded-2xl border-2 border-slate-100 overflow-hidden group">
              {item.type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt="Product media" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all">
                <button
                  type="button"
                  onClick={() => removeMedia(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {formData.media.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
              <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-400">No media assets selected</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Variants & Inventory */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Inventory Variations</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{formData.variants.length} SKU Lineup</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkOpen(!isBulkOpen)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isBulkOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isBulkOpen ? 'Hide Bulk Tool' : 'Bulk Generator'}
            </button>
            <button type="button" onClick={addVariant} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-100">
              Add Single
            </button>
          </div>
        </div>

        {isBulkOpen && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <BulkGenerator onGenerate={generateBulkVariants} baseSku={formData.sku} basePrice={formData.basePrice} />
          </div>
        )}

        <div className="space-y-4">
          {formData.variants.map((v, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:border-primary-100 transition-all group relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Size/Color */}
                <div className="lg:col-span-3 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400">Size</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs font-bold outline-none"
                      value={v.attributes?.size}
                      onChange={(e) => handleVariantChange(idx, 'size', e.target.value, true)}
                    >
                      {STANDARD_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400">Color</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs font-bold outline-none"
                      value={v.attributes?.color}
                      onChange={(e) => handleVariantChange(idx, 'color', e.target.value, true)}
                    />
                  </div>
                </div>

                {/* SKU/Price */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400">SKU Code</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase"
                      value={v.sku}
                      readOnly
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400">Price ($)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs font-bold"
                      value={v.price}
                      placeholder={formData.basePrice}
                      onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                    />
                  </div>
                </div>

                {/* Stock & Hex */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-primary-500">Warehouse Stock</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-xs font-black outline-none"
                      value={v.initialStock}
                      onChange={(e) => handleVariantChange(idx, 'initialStock', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400">Visual Hex</label>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: v.attributes?.colorHex }} />
                      <input
                        type="text"
                        className="w-full px-2 py-2 bg-slate-50 rounded-lg text-[10px] font-mono font-bold"
                        value={v.attributes?.colorHex}
                        onChange={(e) => handleVariantChange(idx, 'colorHex', e.target.value, true)}
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1 flex justify-end pt-4 lg:pt-0">
                  <button onClick={() => removeVariant(idx)} type="button" className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 z-50 flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full max-w-lg py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5 text-primary-400" />}
          <span className="uppercase tracking-widest text-xs">{initialData ? 'Update Product Catalog' : 'Publish Product to Catalog'}</span>
        </button>
      </div>
      {/* Media Gallery Modal */}
      <MediaGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={handleMediaSelect}
        multiple={true}
      />
    </form>
  );
};

export default ProductForm;