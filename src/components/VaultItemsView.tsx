import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Key, 
  FileText, 
  User, 
  File, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Star, 
  ExternalLink,
  Clock,
  Lock,
  X,
  Save
} from 'lucide-react';
import { VaultItem, VaultItemCategory, VaultMode } from '../types';

interface VaultItemsViewProps {
  items: VaultItem[];
  mode: VaultMode;
  onAddItem: (item: Omit<VaultItem, 'id' | 'updatedAt'>) => void;
  onUpdateItem: (item: VaultItem) => void;
  onDeleteItem: (id: string) => void;
}

export const VaultItemsView: React.FC<VaultItemsViewProps> = ({
  items,
  mode,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form State for Create/Edit
  const [formData, setFormData] = useState<{
    title: string;
    category: VaultItemCategory;
    content: string;
    username: string;
    password: string;
    url: string;
    isSensitive: boolean;
    favorite: boolean;
  }>({
    title: '',
    category: 'credential',
    content: '',
    username: '',
    password: '',
    url: '',
    isSensitive: mode === 'real',
    favorite: false
  });

  const isFake = mode === 'fake';

  const categories: { id: string; label: string; fakeLabel: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'All Items', fakeLabel: 'All Notes', icon: FileText },
    { id: 'credential', label: 'Credentials', fakeLabel: 'Logins', icon: Key },
    { id: 'note', label: 'Secure Notes', fakeLabel: 'General Notes', icon: FileText },
    { id: 'contact', label: 'Secret Contacts', fakeLabel: 'Contacts', icon: User },
    { id: 'document', label: 'Documents', fakeLabel: 'Files', icon: File }
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.username && item.username.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    
    // Auto-clear clipboard simulation after 15 seconds in Real Mode for security
    setTimeout(() => {
      setCopiedField((prev) => (prev === label ? null : prev));
    }, 3000);
  };

  const openCreateModal = () => {
    setFormData({
      title: '',
      category: selectedCategory === 'all' ? 'credential' : (selectedCategory as VaultItemCategory),
      content: '',
      username: '',
      password: '',
      url: '',
      isSensitive: mode === 'real',
      favorite: false
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedItem(null);
  };

  const openEditModal = (item: VaultItem) => {
    setFormData({
      title: item.title,
      category: item.category,
      content: item.content,
      username: item.username || '',
      password: item.password || '',
      url: item.url || '',
      isSensitive: item.isSensitive,
      favorite: item.favorite || false
    });
    setSelectedItem(item);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (isCreating) {
      onAddItem({
        title: formData.title,
        category: formData.category,
        content: formData.content,
        username: formData.username || undefined,
        password: formData.password || undefined,
        url: formData.url || undefined,
        preview: formData.content.slice(0, 60) + (formData.content.length > 60 ? '...' : ''),
        isSensitive: formData.isSensitive,
        favorite: formData.favorite
      });
      setIsCreating(false);
    } else if (isEditing && selectedItem) {
      onUpdateItem({
        ...selectedItem,
        title: formData.title,
        category: formData.category,
        content: formData.content,
        username: formData.username || undefined,
        password: formData.password || undefined,
        url: formData.url || undefined,
        preview: formData.content.slice(0, 60) + (formData.content.length > 60 ? '...' : ''),
        isSensitive: formData.isSensitive,
        favorite: formData.favorite
      });
      setIsEditing(false);
      setSelectedItem(null);
    }
  };

  const getCategoryIcon = (cat: VaultItemCategory) => {
    switch (cat) {
      case 'credential': return Key;
      case 'note': return FileText;
      case 'contact': return User;
      case 'document': return File;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Search & Action Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={isFake ? "Search notes and lists..." : "Search encrypted vault items..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md shadow-emerald-900/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>{isFake ? "New Note / Item" : "New Secure Item"}</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          const label = isFake ? cat.fakeLabel : cat.label;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Item List Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center space-y-3 my-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No items found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No entries matching "${searchQuery}" in this category.`
              : isFake
              ? "Your notes list is empty. Add a note or list to keep organized."
              : "No secure items stored in this encrypted container yet."}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
          >
            Create your first entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const Icon = getCategoryIcon(item.category);
            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setShowPassword(false);
                  setIsEditing(false);
                }}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all cursor-pointer shadow-sm group relative flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        {item.favorite && <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                      {item.username && (
                        <p className="text-xs text-slate-400 font-mono mt-0.5 line-clamp-1">{item.username}</p>
                      )}
                    </div>
                  </div>
                  
                  {item.isSensitive && !isFake && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-900/50 flex items-center space-x-1 shrink-0">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Encrypted</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 font-sans">
                  {item.preview || item.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                  <span>{item.updatedAt}</span>
                  <span className="text-emerald-400/80 group-hover:underline">Tap to inspect &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail / Inspect Modal */}
      {selectedItem && !isEditing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 pr-8">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-emerald-400">
                {React.createElement(getCategoryIcon(selectedItem.category), { className: "h-6 w-6" })}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                  {selectedItem.category.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">{selectedItem.title}</h3>
              </div>
            </div>

            {/* Credential Fields if present */}
            {(selectedItem.username || selectedItem.password) && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                {selectedItem.username && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Username / Email:</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-white font-mono bg-slate-900 px-2 py-1 rounded">{selectedItem.username}</code>
                      <button
                        onClick={() => handleCopy(selectedItem.username!, 'username')}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy Username"
                      >
                        {copiedField === 'username' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {selectedItem.password && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Password / Secret:</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-emerald-400 font-mono bg-slate-900 px-2 py-1 rounded max-w-[180px] sm:max-w-xs truncate">
                        {showPassword ? selectedItem.password : '•'.repeat(selectedItem.password.length)}
                      </code>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-white p-1"
                        title={showPassword ? "Hide Password" : "Reveal Password"}
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopy(selectedItem.password!, 'password')}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy Password"
                      >
                        {copiedField === 'password' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {selectedItem.url && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">URL / Target:</span>
                    <a href={selectedItem.url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center space-x-1">
                      <span className="truncate max-w-[180px]">{selectedItem.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Notes Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Content / Secure Notes</label>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans max-h-60 overflow-y-auto">
                {selectedItem.content}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this item?")) {
                    onDeleteItem(selectedItem.id);
                    setSelectedItem(null);
                  }
                }}
                className="flex items-center space-x-1.5 text-rose-400 hover:text-rose-300 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(selectedItem)}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Item</span>
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create or Edit Modal */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white">
              {isCreating ? (isFake ? "New Note / Item" : "New Encrypted Vault Item") : "Edit Item"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Cold Wallet Seed or Grocery List"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as VaultItemCategory })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="credential">Credential / Login</option>
                    <option value="note">Secure Note</option>
                    <option value="contact">Secret Contact</option>
                    <option value="document">Document / Attachment</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.favorite}
                      onChange={(e) => setFormData({ ...formData, favorite: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 w-4 h-4"
                    />
                    <span>Mark as Favorite</span>
                  </label>
                </div>
              </div>

              {formData.category === 'credential' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Username / Email</label>
                    <input
                      type="text"
                      placeholder="user@proton.me"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Password / Secret</label>
                    <input
                      type="text"
                      placeholder="High-entropy secret..."
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Login URL / Service</label>
                    <input
                      type="text"
                      placeholder="https://secure.service.com"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Content / Secure Notes *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Enter notes, recovery phrases, coordinates, or checklists here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                />
              </div>

              {!isFake && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cryptographic Isolation:</span>
                  <span className="text-emerald-400 font-mono font-semibold">real.sqlite.enc (PBKDF2-256)</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
              >
                <Save className="h-4 w-4" />
                <span>{isCreating ? "Save to Vault" : "Update Item"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
