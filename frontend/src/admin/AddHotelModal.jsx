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

const REQUIRED_DOCS = {
  hotel: ["gst", "business license", "fire safety certificate"],
  services: {
    food: ["food license"],
    trainer: ["trainer license"],
    default: ["service proof"],
  },
  experiences: {
    trekking: ["trekking permit"],
    tour: ["tour id"],
    default: ["experience proof"],
  },
};

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
  const [documentFiles, setDocumentFiles] = useState({});
  const [approvedDocsMap, setApprovedDocsMap] = useState({});
  const [slots, setSlots] = useState([{ time: "", maxGuests: "" }]);

  const handleRemoveImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const getRequiredDocuments = () => {
    if (type === "hotel") return REQUIRED_DOCS.hotel;
    const cat = formData.category?.toLowerCase();
    if (type === "services")
      return REQUIRED_DOCS.services[cat] || REQUIRED_DOCS.services.default;
    if (type === "experiences")
      return (
        REQUIRED_DOCS.experiences[cat] || REQUIRED_DOCS.experiences.default
      );
    return [];
  };

  const handleDocumentChange = (e, docType) => {
    setDocumentFiles((prev) => ({ ...prev, [docType]: e.target.files[0] }));
  };

  const handleAmenityKeyDown = (e) => {
    if (["Enter", ","].includes(e.key)) {
      e.preventDefault();
      const trimmed = e.target.value.trim();
      if (trimmed && !amenitiesList.includes(trimmed)) {
        const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        const newList = [...amenitiesList, capitalized];
        setAmenitiesList(newList);
        setFormData((prev) => ({ ...prev, amenities: newList }));
        e.target.value = "";
      }
    }
  };

  const removeAmenity = (index) => {
    const updated = amenitiesList.filter((_, i) => i !== index);
    setAmenitiesList(updated);
    setFormData((prev) => ({ ...prev, amenities: updated }));
  };

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        ...formData,
        ...initialData,
        highlights: (initialData.highlights || []).join(","),
      });
      setAmenitiesList(initialData.amenities || []);
      if (initialData.images) {
        setImages(initialData.images.map((url) => ({ url, file: null })));
      }
      const approvedMap = {};
      for (const doc of initialData.documents || []) {
        if (doc.status === "approved") {
          approvedMap[doc.docType] = true;
        }
      }

      setApprovedDocsMap(approvedMap);
      if (
        (type === "services" || type === "experiences") &&
        initialData.slots
      ) {
        setSlots(initialData.slots);
      }
    }
  }, [editMode, initialData]);

  const shouldShowDocumentSection =
    !editMode ||
    (initialData.status !== "approved" &&
      getRequiredDocuments().some((doc) => approvedDocsMap[doc] !== true));

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5)
      return toast.error("Exactly 5 images required.");
    const newImgs = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImgs].slice(0, 5));
  };

  const handleSubmit = async () => {
    if (images.length !== 5) {
      return toast.error("Exactly 5 images are required.");
    }

    setLoading(true);
    const form = new FormData();

    // Include common fields based on type
    const activeFields = {
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
        "highlights",
        "aboutHost",
      ],
    }[type];

    activeFields.forEach((key) => form.append(key, formData[key]));

    if (type === "services" || type === "experiences") {
      slots.forEach((slot, i) => {
        form.append(`slots[${i}][time]`, slot.time);
        form.append(`slots[${i}][maxGuests]`, slot.maxGuests);
      });
    }

    // ✅ Append new image files
    images.forEach((img) => {
      if (img.file) {
        form.append("images", img.file);
      }
    });

    // ✅ Append existing image URLs (in edit mode only)
    if (editMode) {
      const existingImageUrls = images
        .filter((img) => !img.file && img.url)
        .map((img) => img.url);
      existingImageUrls.forEach((url) => form.append("existingImages", url));
    }

    // ✅ Append document files (skip approved)
    const docTypes = getRequiredDocuments();
    const docTypeList = [];

    for (const docType of docTypes) {
      const file = documentFiles[docType];
      // 👇 Only send if not approved
      if (file && !approvedDocsMap[docType]) {
        form.append(editMode ? "docFile" : "documents", file); // ✅ no dynamic fieldname
        docTypeList.push(docType); // ✅ will match backend docTypes
      }
    }
    form.append("documentTypes", docTypeList);

    // ✅ Submit to API
    const { url, key } = getApiUrls(type, editMode, initialData._id);
    try {
      const res = await axios[editMode ? "put" : "post"](url, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(`${type} ${editMode ? "updated" : "created"} successfully`);
      onSuccess(res.data[key]);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
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
          {(type === "services" || type === "experiences") && (
            <div>
              <label className="font-medium block mb-2">
                {type === "services" ? "Service" : "Experience"} Time Slots
              </label>
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-2"
                >
                  <input
                    type="time"
                    value={slot.time}
                    onChange={(e) => {
                      const updated = [...slots];
                      updated[index].time = e.target.value;
                      setSlots(updated);
                    }}
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="number"
                    min={1}
                    value={slot.maxGuests}
                    onChange={(e) => {
                      const updated = [...slots];
                      updated[index].maxGuests = e.target.value;
                      setSlots(updated);
                    }}
                    className="border px-3 py-2 rounded-md"
                    placeholder="Max Guests for this slot"
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  setSlots([...slots, { time: "", maxGuests: "" }])
                }
                type="button"
                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                + Add Slot
              </button>
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

          {/* ✅ Document Upload Section */}
          {shouldShowDocumentSection && (
            <div>
              <label className="block font-semibold mb-2">
                Required Documents
              </label>
              <div className="space-y-3">
                {getRequiredDocuments().map((docType, i) => {
                  // ✅ In editMode: skip rendering for approved docs
                  if (editMode && approvedDocsMap[docType] === true)
                    return null;

                  return (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row md:items-center gap-4"
                    >
                      <label className="capitalize font-medium w-40">
                        {docType}
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentChange(e, docType)}
                        className="border px-3 py-2 rounded-md w-full"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-4 items-start md:items-center">
            <button
              onClick={handleSubmit}
              disabled={loading || images.length !== 5}
              className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
                images.length !== 5
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading
                ? "Submitting..."
                : editMode
                ? `Update ${type}`
                : `Add ${type}`}
            </button>

            <button
              onClick={onClose}
              className="border border-gray-300 px-6 py-3 rounded-lg"
            >
              Cancel
            </button>

            {/* Error message for image count */}
            {images.length !== 5 && (
              <p className="text-red-600 text-sm mt-2 md:mt-0">
                Exactly 5 images are required to proceed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListingModal;
