import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Button, Input, Textarea, Card, LoadingSpinner, PageHeader } from "../components/ui";

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLocation.name.trim()) return;

    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocation),
      });

      if (response.ok) {
        const location = await response.json();
        setLocations([location, ...locations]);
        setNewLocation({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Error creating location:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading locations..." size="lg" />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader 
        title="Locations"
        subtitle="Create and manage story locations and settings"
      />

      {/* Location Creation Form */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Location</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={newLocation.name}
            onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
            required
            helperText="Enter the name of the location (e.g., 'Castle of Storms', 'Mars Research Station')"
          />

          <Textarea
            label="Description"
            value={newLocation.description}
            onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
            rows={4}
            helperText="Describe the location's appearance, atmosphere, and key features"
          />

          <Button type="submit" variant="primary">
            Create Location
          </Button>
        </form>
      </Card>

      {/* Locations List */}
      {locations.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg">No locations created yet.</p>
          <p className="text-gray-400 mt-2">Create your first location using the form above.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card 
              key={location._id || `temp-${location.name}`}
              onClick={() => setSelectedLocation(location)}
              hoverable
              className="cursor-pointer"
            >
              {location.imageUrl && (
                <div className="mb-4">
                  <img
                    src={location.imageUrl}
                    alt={location.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {location.name}
              </h3>
              
              <p className="text-gray-600 text-sm line-clamp-3">
                {location.description || "No description available."}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Location Detail Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedLocation.name}</h2>
              <Button variant="ghost" onClick={() => setSelectedLocation(null)}>
                ✕
              </Button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {selectedLocation.imageUrl && (
                  <div>
                    <img
                      src={selectedLocation.imageUrl}
                      alt={selectedLocation.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">
                    {selectedLocation.description || "No description available."}
                  </p>
                </div>

                {selectedLocation.tags && selectedLocation.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Locations;