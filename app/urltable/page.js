"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AssetTable() {
  const [assets, setAssets] = useState([]);
  const [searchTag, setSearchTag] = useState(""); // ✅ Added dynamic tag search
  const [loading, setLoading] = useState(true); // ✅ Loading state

  // Fetch all assets when the page loads
  useEffect(() => {
    const fetchAssets = async () => {
      const res = await fetch(`/api/search?page=1&limit=9999`);
      const data = await res.json();
      setAssets(data.images || []);
      setLoading(false); // ✅ Stop loading
    };

    fetchAssets();
  }, []);

  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = "auth=; path=/; max-age=0;";
    router.push("/");
  };

  // Filter assets dynamically based on tag input
  const filteredAssets = assets.filter((asset) =>
    searchTag
      ? asset.tags.some((tag) =>
          tag.toLowerCase().includes(searchTag.toLowerCase())
        )
      : true
  );

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-4 text-center">
        Asset URLs and Tags
      </h1>
      <div className="flex justify-center items-center space-x-4 mt-4">
        <Link
          href="/imagemanager"
          className="bg-slate-700 text-white rounded px-4 py-2 text-center w-fit text-sm"
        >
          Asset Manager
        </Link>
        <Link
          href="/gallery"
          className="bg-slate-700 text-white rounded px-4 py-2 text-center w-fit text-sm"
        >
          Gallery
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white rounded px-4 py-2 text-sm"
        >
          Logout
        </button>
      </div>
      <p className="text-sm text-center mb-4 mt-4">
        Easily copy and paste asset URLs with their tags for use in other
        applications.
      </p>

      {/* Tag Search Input */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Search by tag..."
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          className="px-4 py-2 border rounded w-1/2"
        />
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center text-gray-500 my-4">
          <p className="font-semibold">Loading assets...</p>
          <div className="w-full h-2 bg-gray-300 rounded mt-2">
            <div className="h-2 bg-blue-500 rounded w-3/4 animate-pulse"></div>{" "}
            {/* Progress Bar */}
          </div>
        </div>
      )}

      {/* Responsive Table */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-6 py-3 text-left font-semibold">Preview</th>
                <th className="px-6 py-3 text-left font-semibold">URL</th>
                <th className="px-6 py-3 text-left font-semibold">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                >
                  {/* Image Preview */}
                  <td className="px-6 py-4">
                    <Image
                      src={asset.url}
                      alt={`Asset ${index + 1}`}
                      width={80}
                      height={80}
                      className="rounded shadow-sm object-cover"
                      unoptimized
                    />
                  </td>

                  {/* Asset URL */}
                  <td className="px-6 py-4 text-sm text-gray-700 break-all">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {asset.url}
                    </a>
                  </td>

                  {/* Tags */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {asset.tags && asset.tags.length > 0
                      ? asset.tags.join(", ")
                      : "No tags available"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message for Empty Data */}
      {!loading && filteredAssets.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No assets match the search criteria.
        </p>
      )}
    </div>
  );
}
