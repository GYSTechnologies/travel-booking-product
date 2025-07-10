import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ReactSortable } from "react-sortablejs";

const getApiUrls = (type, editMode, id) => {
  const base = "http://localhost:4000/api";

  if (type === "hotel") {
    return {
      url: editMode
        ? `${base}/host/hotel-update/${id}`
        : `${base}/host/hotel-create`,
      key: "hotel",
    };
  }
  if (type === "services") {
    return {
      url: editMode
        ? `${base}/services/update/${id}`
        : `${base}/services/create-service`,
      key: "service",
    };
  }
  if (type === "experiences") {
    return {
      url: editMode
        ? `${base}/experiences/update/${id}`
        : `${base}/experiences/create-experience`,
      key: "experience",
    };
  }

  return { url: "", key: "" };
};

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const SERVICE_CATEGORIES = ["photography", "spa", "food", "trainer", "dancer"];


const AddListingModal = ({
  token = "",
  onClose = () => {},
  onSuccess = () => {},
  editMode = false,
  initialData = {},
  type = "hotel",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    state: "",
    area: "",
    pricePerNight: "",
    availableRooms: "",
    pricePerHead: "",
    maxGuests: "",
    duration: "",
    category: "",
    amenities: "",
    aboutHost: "",
    highlights: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [amenitiesList, setAmenitiesList] = useState([]);

  const handleAmenityKeyDown = (e) => {
    if (["Enter", ","].includes(e.key)) {
      e.preventDefault();
      const trimmed = e.target.value.trim();
      if (trimmed && !amenitiesList.includes(trimmed)) {
        const capitalized = capitalizeWords(trimmed);

        setAmenitiesList([...amenitiesList, capitalized]);
        setFormData({
          ...formData,
          amenities: [...amenitiesList, capitalized],
        });

        e.target.value = "";
      }
    }
  };

  // ✅ Helper function
  const capitalizeWords = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  const removeAmenity = (index) => {
    const updated = amenitiesList.filter((_, i) => i !== index);
    setAmenitiesList(updated);
    setFormData({ ...formData, amenities: updated });
  };

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        location: initialData.location || "",
        state: initialData.state || "",
        area: initialData.area || "",
        pricePerNight: initialData.pricePerNight || "",
        availableRooms: initialData.availableRooms || "",
        pricePerHead: initialData.pricePerHead || "",
        maxGuests: initialData.maxGuests || "",
        duration: initialData.duration || "",
        category: initialData.category || "",
        amenities: initialData.amenities || [],
        aboutHost: initialData.aboutHost || "",
        highlights: (initialData.highlights || []).join(","), // highlights is okay
      });

      // ✅ Pre-fill tag view
      if (initialData.amenities?.length) {
        setAmenitiesList(initialData.amenities);
      }

      if (initialData.images?.length) {
        setImages(initialData.images.map((url) => ({ url, file: null })));
      }
    }
  }, [editMode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error("You must upload exactly 5 images.");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages].slice(0, 5));
  };

  const handleRemoveImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleSubmit = async () => {
    if (images.length !== 5) {
      toast.error("Exactly 5 images required.");
      return;
    }

    setLoading(true);
    const form = new FormData();

    const fieldsMap = {
      hotel: [
        "title",
        "description",
        "state",
        "area",
        "location",
        "pricePerNight",
        "availableRooms",
        "amenities",
      ],
      experiences: [
        "title",
        "category",
        "location",
        "state",
        "description",
        "duration",
        "pricePerHead",
        "maxGuests",
        "highlights",
        "aboutHost",
      ],
      services: [
        "title",
        "category",
        "location",
        "state",
        "description",
        "duration",
        "pricePerHead",
        "maxGuests",
        "highlights",
        "aboutHost",
      ],
    };

    const activeFields = fieldsMap[type] || [];
    activeFields.forEach((key) => form.append(key, formData[key]));

    images.forEach((img) => {
      if (img.file) {
        form.append("images", img.file);
      }
    });

    const { url, key } = getApiUrls(type, editMode, initialData._id);

    try {
      const res = await axios[editMode ? "put" : "post"](url, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`${type} ${editMode ? "updated" : "added"}!`);
      onSuccess(res.data[key]);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${editMode ? "update" : "add"} ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setImages(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white capitalize">
              {editMode ? `Edit ${type}` : `Add New ${type}`}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Title + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Title *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter title"
              />
            </div>
            {type === "services" ? (
              <div>
                <label className="font-medium">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">Select Category</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            ) : type !== "hotel" ? (
              <div>
                <label className="font-medium">Category</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Enter category"
                />
              </div>
            ) : null}
          </div>

          {/* Location Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-medium">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {type === "hotel" && (
            <div>
              <label className="font-medium">Area</label>
              <input
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
              rows={4}
            />
          </div>

          {/* Pricing & Capacity */}
          {type === "hotel" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Price Per Night</label>
                <input
                  name="pricePerNight"
                  type="number"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-medium">Available Rooms</label>
                <input
                  name="availableRooms"
                  type="number"
                  value={formData.availableRooms}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Price Per Head</label>
                <input
                  name="pricePerHead"
                  type="number"
                  value={formData.pricePerHead}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-medium">Max Guests</label>
                <input
                  name="maxGuests"
                  type="number"
                  value={formData.maxGuests}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="font-medium">Duration</label>
                <input
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="e.g. 2h, 3 days"
                />
              </div>
            </div>
          )}

          {/* Amenities or Highlights/About Host */}
          {type === "hotel" ? (
            <div>
              <label className="font-medium block mb-2">Amenities</label>

              {/* Input Box */}
              <input
                type="text"
                onKeyDown={handleAmenityKeyDown}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Type amenity and press Enter or comma"
              />

              {/* Preview Tags */}
              <div className="flex flex-wrap mt-2 gap-2">
                {amenitiesList.map((item, index) => (
                  <span
                    key={index}
                    className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {item}
                    <button
                      onClick={() => removeAmenity(index)}
                      className="text-emerald-700 hover:text-red-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium">About Host</label>
                <input
                  name="aboutHost"
                  value={formData.aboutHost}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-medium">Highlights</label>
                <input
                  name="highlights"
                  value={formData.highlights}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Key highlights (comma-separated)"
                />
              </div>
            </div>
          )}

          {/* Image Upload */}

          <div>
            <label className="font-medium block mb-2">Upload Images (5)</label>

            {/* Hidden file input */}
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              disabled={images.length >= 5}
            />

            {/* Custom styled label */}
            <label
              htmlFor="fileUpload"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium cursor-pointer transition
      ${
        images.length >= 5
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-emerald-600 hover:bg-emerald-700"
      }
    `}
            >
              {/* Upload icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4-4m0 0l-4 4m4-4v12"
                />
              </svg>
              Upload Images
            </label>

            {/* Preview section */}
            <ReactSortable
              list={images}
              setList={setImages}
              animation={200}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2"
            >
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative border rounded-lg overflow-hidden shadow group"
                >
                  <img
                    src={img.url}
                    alt={`preview-${i}`}
                    className="w-full h-32 object-cover"
                  />
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </ReactSortable>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all"
            >
              {loading
                ? editMode
                  ? "Updating..."
                  : "Adding..."
                : `${editMode ? "Update" : "Add"} ${type}`}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AddListingModal;
