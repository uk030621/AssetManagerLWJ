"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  // Upload states
  const [files, setFiles] = useState([]);
  const [folder, setFolder] = useState("");
  const [tags, setTags] = useState("");

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFolder, setSearchFolder] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Delete confirmation states
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);

  // Handle File Selection for Upload
  const handleFileChange = (e) => setFiles(Array.from(e.target.files));

  // Upload Images to Cloudinary & MongoDB
  const handleUpload = async () => {
    if (!files.length) return alert("Please select files to upload.");

    const uploadedUrls = [];
    for (let file of files) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: reader.result, folder, tags }),
        });

        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      };
      reader.readAsDataURL(file);
    }

    alert("Images uploaded successfully!");
    setFiles([]); // Clear selected files
    setFolder("");
    setTags("");
  };

  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = "auth=; path=/; max-age=0;";
    router.push("/");
  };

  // Search Images with Pagination
  const handleSearch = async (page = 1) => {
    setCurrentPage(page);

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (searchFolder) params.append("folder", searchFolder);
    params.append("page", page);
    params.append("limit", 10);
    if (startDate && endDate) {
      params.append("startDate", startDate);
      params.append("endDate", endDate);
    }

    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();
    setSearchResults(data.images || []);
    setTotalPages(data.totalPages || 1);
  };

  const handleRefresh = () => {
    setFiles([]);
    setFolder("");
    setTags("");
    setSearchTerm("");
    setSearchFolder("");
    setStartDate("");
    setEndDate("");
    setSearchResults([]);
    setCurrentPage(1);
    setTotalPages(1);
  };

  // Delete Images (Cloudinary + MongoDB)
  const handleDelete = async (public_id) => {
    const res = await fetch("/api/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id }),
    });

    const data = await res.json();
    if (data.success) {
      setSearchResults((prev) =>
        prev.filter((img) => img.public_id !== public_id)
      );
    }
    setShowConfirmDelete(false);
  };

  return (
    <div className="flex flex-col items-center p-8">
      {/* Upload Section */}
      <h2 className="text-xl font-bold mb-4">Asset Manager</h2>
      <div className="flex gap-4">
        <label className="flex items-center justify-center bg-slate-800 text-white border rounded px-4 py-2 cursor-pointer mb-2 ">
          Choose Assets
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <button
          onClick={handleLogout}
          className=" bg-red-500 text-white rounded mb-2 px-4"
        >
          Logout
        </button>
      </div>
      <input
        type="text"
        placeholder="Enter folder name"
        value={folder}
        onChange={(e) => setFolder(e.target.value)}
        className="pl-2 mb-4 border text-sm rounded w-[250px]"
      />
      <input
        type="text"
        placeholder="Enter tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="pl-2 mb-4 border text-sm rounded w-[250px]"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Upload
      </button>
      <div className="flex gap-4">
        <Link
          href="/gallery"
          className="bg-black text-white rounded mt-4 px-4 py-2 text-sm"
        >
          Gallery
        </Link>
        <Link
          href="/urltable"
          className="bg-black text-white rounded mt-4 px-4 py-2 text-sm"
        >
          URLs
        </Link>
      </div>
      {/* Search Section */}
      <h2 className="text-xl font-bold mt-8 mb-4">Search Images</h2>
      <input
        type="text"
        placeholder="Search by folder"
        value={searchFolder}
        onChange={(e) => setSearchFolder(e.target.value)}
        className="pl-2 mb-4 border text-sm rounded w-[250px]"
      />
      <input
        type="text"
        placeholder="Search by tag"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-2 mb-4 border text-sm rounded w-[250px]"
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="pl-2 mb-4 text-sm border rounded"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="pl-2 mb-4 text-sm border rounded "
      />
      <button
        onClick={() => handleSearch(1)}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Search
      </button>

      <button
        onClick={handleRefresh}
        className="bg-gray-700 text-white px-4 py-2 rounded mt-4"
      >
        Refresh
      </button>

      {/* Display Search Results & Pagination */}
      <h2 className="text-xl font-bold mt-8 mb-4">Search Results</h2>
      <div className="grid grid-cols-1 gap-4">
        {searchResults.map((img, index) => (
          <div key={index} className="flex flex-col items-center w-64 h-auto">
            <Image
              src={img.url}
              alt={`Image ${index + 1}`}
              width={256}
              height={256}
              className="rounded"
              unoptimized // ✅ This prevents Next.js from trying to optimize it
            />
            <a
              href={img.url}
              download
              className="bg-gray-800 text-white px-4 py-2 rounded mt-2"
            >
              Download
            </a>
            <button
              onClick={() => {
                setSelectedImageId(img.public_id);
                setShowConfirmDelete(true);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between w-64">
        <button
          onClick={() => handleSearch(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handleSearch(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

      {/* Delete Confirmation Popup */}
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>Are you sure you want to delete this asset?</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handleDelete(selectedImageId)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
