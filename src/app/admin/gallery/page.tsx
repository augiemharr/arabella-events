"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useAdminAuth } from "@/hooks/useAdmin";
import { useGallery } from "@/hooks/useGallery";
import AdminHeader from "@/components/AdminHeader";

const CATEGORIES = ["Venue", "Setup", "Food", "Decor", "General"];

export default function AdminGalleryPage() {
  const { loading: authLoading, logout } = useAdminAuth();
  const { photos, loading: galleryLoading, error, addPhoto, deletePhoto, updatePhoto } = useGallery();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const loading = authLoading || galleryLoading;

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await addPhoto(file, file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "), "General");
      }
    } catch (err) {
      alert("Upload failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDelete = async (id: string, src: string) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await deletePhoto(id, src);
    } catch (err) {
      alert("Delete failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const startEdit = (photo: { id: string; alt: string; category: string }) => {
    setEditId(photo.id);
    setEditAlt(photo.alt);
    setEditCategory(photo.category);
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      await updatePhoto(editId, { alt: editAlt, category: editCategory });
      setEditId(null);
    } catch (err) {
      alert("Update failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-300 flex items-center justify-center">
        <p className="text-gray-400 text-xs">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300">
      <AdminHeader
        title="Gallery Manager"
        rightItems={[
          { label: "Dashboard", href: "/admin" },
          { label: "Site", href: "/" },
          { label: "Logout", onClick: logout },
        ]}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
        )}

        {/* Upload Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            dragOver ? "border-gray-900 bg-gray-200" : "border-gray-300 bg-white hover:border-gray-400"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          {uploading ? (
            <p className="text-sm text-gray-500">Uploading...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">Click or drag photos here</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
            </>
          )}
        </div>

        {/* Photo Grid */}
        {photos.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
            <p className="text-sm text-gray-300">No photos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white border border-gray-300 rounded-lg overflow-hidden group">
                <div className="relative aspect-square">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(photo)}
                      className="px-2.5 py-1 bg-white text-gray-800 text-xs rounded-md font-medium hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id, photo.src)}
                      className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-md font-medium hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-800 truncate">{photo.alt || "No description"}</p>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                    {photo.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Edit Photo</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Description</label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditId(null)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
