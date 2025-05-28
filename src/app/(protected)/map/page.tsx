'use client';

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Map</h2>
        <p className="text-gray-600">
          This page will display a map showing the locations of students in the Alternative Learning System.
          The map will be implemented using React Leaflet with OpenStreetMap.
        </p>
      </div>
    </div>
  );
}
