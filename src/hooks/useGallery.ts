"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  category: string;
  sort_order: number;
  created_at: string;
}

export function useGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchPhotos = async () => {
      const { data, error: fetchError } = await supabase
        .from("gallery")
        .select("*")
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setPhotos(data || []);
      }
      setLoading(false);
    };
    fetchPhotos();
    return () => { cancelled = true; };
  }, []);

  const addPhoto = useCallback(async (file: File, alt: string, category: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(filePath);

    const maxOrder = photos.reduce((max, p) => Math.max(max, p.sort_order), -1);

    const { data: newRow, error: insertError } = await supabase
      .from("gallery")
      .insert({
        src: urlData.publicUrl,
        alt,
        category,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    setPhotos((prev) => [...prev, newRow]);
    return newRow;
  }, [photos]);

  const deletePhoto = useCallback(async (id: string, src: string) => {
    const url = new URL(src);
    const path = url.pathname.split("/storage/v1/object/public/gallery/")[1];

    if (path) {
      await supabase.storage.from("gallery").remove([path]);
    }

    const { error: deleteError } = await supabase
      .from("gallery")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePhoto = useCallback(async (id: string, updates: Partial<Pick<GalleryPhoto, "alt" | "category" | "sort_order">>) => {
    const { error } = await supabase
      .from("gallery")
      .update(updates)
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  return { photos, loading, error, addPhoto, deletePhoto, updatePhoto };
}

export function usePublicGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      setPhotos(data || []);
      setLoading(false);
    };
    fetchPhotos();
    return () => { cancelled = true; };
  }, []);

  return { photos, loading };
}
