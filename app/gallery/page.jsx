"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function GalleryPage() {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [assets, setAssets] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);

  useEffect(() => {
    async function fetchTags() {
      const res = await fetch("/api/tags");
      const data = await res.json();
      setTags(data);
    }
    fetchTags();
  }, []);

  useEffect(() => {
    async function fetchAssets() {
      if (selectedTags.length === 0) return setAssets([]);
      const res = await fetch(`/api/search?search=${selectedTags.join(",")}`);
      const data = await res.json();
      setAssets(data.images || []);
    }
    fetchAssets();
  }, [selectedTags]);

  const handleRefresh = () => {
    setAssets([]);
    setSelectedTags("");
  };

  const handleRemove = (id) => {
    setExcludedIds((prev) => [...prev, id]);
  };

  const visibleAssets = assets.filter((img) => !excludedIds.includes(img._id));

  return (
    <div className="bg-background w-screen h-screen">
      <div className="max-w-5xl mx-auto p-6 ">
        <div className="flex gap-3">
          <Link
            href="/imagemanager"
            className="bg-slate-700 text-white rounded mt-4 px-4 py-2 text-sm"
          >
            Asset Manager
          </Link>
          <Link
            href="/urltable"
            className="bg-slate-700 text-white rounded mt-4 px-4 py-2 text-sm "
          >
            URLs
          </Link>
          <button
            onClick={handleRefresh}
            className="bg-gray-700 text-white px-4 py-2 rounded mt-4 text-sm"
          >
            Refresh
          </button>
        </div>
        <h1 className="text-3xl font-bold  mt-4">Asset Selector</h1>

        <label className="block mb-1 text-sm font-medium mt-3">
          Choose tags
        </label>
        <select
          multiple
          className="p-2 border rounded h-30 w-full"
          value={selectedTags}
          onChange={(e) =>
            setSelectedTags(
              [...e.target.selectedOptions].map((opt) => opt.value)
            )
          }
        >
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {visibleAssets.map((asset) => (
            <div
              key={asset._id}
              className="bg-white rounded shadow overflow-hidden"
            >
              <div className="relative w-full aspect-[4/3] bg-white">
                <Image
                  src={asset.url}
                  alt={asset.public_id}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-2 flex justify-between items-center">
                <p className="truncate text-sm">{asset.public_id}</p>
                <button
                  className="text-red-500 text-xs hover:underline"
                  onClick={() => handleRemove(asset._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
