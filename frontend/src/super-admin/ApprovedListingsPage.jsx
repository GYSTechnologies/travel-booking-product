import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { toast } from "react-toastify";

const ApprovedListingsPage = () => {
  const [listings, setListings] = useState({ hotels: [], services: [], experiences: [] });
  const [typeFilter, setTypeFilter] = useState("all");
  const [previewModal, setPreviewModal] = useState({ open: false, type: '', data: [], title: '', currentIndex: 0 });
  const [documentPreview, setDocumentPreview] = useState({ open: false, url: '', title: '', type: '' });

  const { token } = useSuperAdmin();

  

  // const fetchApprovedListings = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:4000/api/super-admin/listings/approved", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setListings(res.data);
  //   } catch (error) {
  //     console.error("Error fetching approved listings:", error);
  //     toast.error("Failed to fetch approved listings");
  //   }
  // };

  const loadApprovedListings = async () => {
  try {
    const data = await fetchApprovedListings(token);
    setListings(data);
  } catch (error) {
    console.error("Error fetching approved listings:", error);
    toast.error("Failed to fetch approved listings");
  }
};

useEffect(() => {
    loadApprovedListings();
  }, []);


  const filteredListings = () => {
    if (typeFilter === "all") return [...listings.hotels, ...listings.services, ...listings.experiences];
    return listings[typeFilter] || [];
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "hotel":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "service":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "experience":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
    }
  };

  const getFilterIcon = (type) => {
    return getTypeIcon(type);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getListingType = (listing) => {
    if (listing.pricePerNight) return "hotel";
    if (listing.pricePerHead) return "service";
    return "experience";
  };

  const openPreview = (type, data, title) => {
    setPreviewModal({ open: true, type, data, title, currentIndex: 0 });
  };

  const closePreview = () => {
    setPreviewModal({ open: false, type: '', data: [], title: '', currentIndex: 0 });
  };

  const nextImage = () => {
    setPreviewModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.data.length
    }));
  };

  const prevImage = () => {
    setPreviewModal(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.data.length - 1 : prev.currentIndex - 1
    }));
  };


const openDocumentPreview = (doc, listingTitle) => {
  setDocumentPreview({
    open: true,
    url: doc.url,
    title: `${listingTitle} - ${doc.docType}`,
    type: doc.docType
  });
};

const closeDocumentPreview = () => {
  setDocumentPreview({ open: false, url: '', title: '', type: '' });
};

// Enhanced PreviewModal component
const PreviewModal = () => {
  if (!previewModal.open) return null;

  return (
    <div className="fixed inset-0 z-50 p-4">
      {/* Blurred Background */}
      <div 
        className="absolute inset-0 bg-opacity-60"
        style={{
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)'
        }}
        onClick={closePreview}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl mx-auto mt-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h3 className="text-lg font-bold text-slate-800">
            {previewModal.type === 'images' ? '📸 Images' : '📄 Documents'} - {previewModal.title}
          </h3>
          <button
            onClick={closePreview}
            className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {previewModal.type === 'images' ? (
            <div className="space-y-4">
              {previewModal.data.length > 0 ? (
                <>
                  {/* Main Image Display */}
                  <div className="relative bg-slate-100 rounded-xl overflow-hidden">
                    <img
                      src={previewModal.data[previewModal.currentIndex]}
                      alt={`Image ${previewModal.currentIndex + 1}`}
                      className="w-full h-96 object-cover"
                    />
                    
                    {/* Navigation Buttons */}
                    {previewModal.data.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                        >
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                        >
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {previewModal.currentIndex + 1} / {previewModal.data.length}
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  {previewModal.data.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {previewModal.data.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setPreviewModal(prev => ({ ...prev, currentIndex: index }))}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === previewModal.currentIndex
                              ? 'border-emerald-500 shadow-lg'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No images available</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {previewModal.data.length > 0 ? (
                previewModal.data.map((doc, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{doc.docType}</p>
                        <p className="text-sm text-slate-500">Document {index + 1}</p>
                      </div>
                      <button
                        onClick={() => openDocumentPreview(doc, previewModal.title)}
                        className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors duration-200"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No documents available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Document Preview Modal
const DocumentPreviewModal = () => {
  if (!documentPreview.open) return null;

  return (
    <div className="fixed inset-0 z-50 p-2">
      {/* Blurred Background */}
      <div 
        className="absolute inset-0  bg-opacity-60"
        style={{
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)'
        }}
        onClick={closeDocumentPreview}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-full max-h-[98vh] overflow-hidden shadow-2xl mx-auto mt-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <h3 className="text-lg font-bold text-slate-800">
            📄 {documentPreview.title}
          </h3>
          <div className="flex items-center space-x-3">
            <a
              href={documentPreview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors duration-200"
            >
              Open in New Tab
            </a>
            <button
              onClick={closeDocumentPreview}
              className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-1 max-h-[calc(98vh-80px)] overflow-hidden">
          <iframe
            src={documentPreview.url}
            title={documentPreview.title}
            className="w-full h-full border-0 rounded-lg"
            style={{ minHeight: '700px' }}
          />
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 flex flex-col">
      <style>{`
        .smooth-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .smooth-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .smooth-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #14b8a6, #10b981);
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        
        .smooth-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0f766e, #059669);
        }
        
        .smooth-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #14b8a6 #f1f5f9;
          scroll-behavior: smooth;
        }
      `}</style>
      
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Approved Listings
          </h1>
        </div>
        <p className="text-slate-600 ml-13">View all approved property listings</p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex flex-wrap gap-3">
          {["all", "hotels", "services", "experiences"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                typeFilter === type
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg border-transparent transform scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-50 hover:shadow-md border-slate-200 hover:border-emerald-300"
              }`}
            >
              <span className={typeFilter === type ? "text-white" : "text-slate-500"}>
                {type === "all" ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ) : getFilterIcon(type.slice(0, -1))}
              </span>
              <span>
                {type === "all"
                  ? "All Types"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content - Scrollable Section */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto smooth-scrollbar p-5">
          {filteredListings().length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-500 text-lg font-medium">
                No approved {typeFilter === "all" ? "listings" : typeFilter} found
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Check back later for approved content
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {filteredListings().map((listing) => (
                <div
                  key={listing._id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer group"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-300 flex-shrink-0">
                          <span className="text-slate-600 group-hover:text-white transition-colors duration-300">
                            {getTypeIcon(getListingType(listing))}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors duration-300 truncate" title={listing.title}>
                            {truncateText(listing.title, 20)}
                          </h2>
                          <p className="text-sm text-slate-500 capitalize">
                            {listing.category || getListingType(listing)}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 bg-green-100 text-green-800 border-green-200">
                        APPROVED
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-emerald-600">
                        ₹{listing.pricePerNight || listing.pricePerHead || 'N/A'}
                      </span>
                      <span className="text-slate-500 text-sm ml-1">
                        per {getListingType(listing) === 'hotel' ? 'night' : 'head'}
                      </span>
                      {listing.duration && (
                        <span className="text-slate-500 text-sm ml-2">• {listing.duration}</span>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-2 text-slate-600 mb-4 min-w-0">
                      <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm truncate" title={`${listing.state}, ${listing.location}`}>
                        <span className="font-medium">{truncateText(listing.state, 10)}</span>, {truncateText(listing.location, 15)}
                      </span>
                    </div>

                    {/* Description */}
                    {listing.description && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-600 line-clamp-2" title={listing.description}>
                          {truncateText(listing.description, 80)}
                        </p>
                      </div>
                    )}

                    {/* Highlights */}
                    {listing.highlights && listing.highlights.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {listing.highlights.slice(0, 3).map((highlight, index) => (
                            <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                              {truncateText(highlight, 15)}
                            </span>
                          ))}
                          {listing.highlights.length > 3 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                              +{listing.highlights.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
                      {listing.maxGuests && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <span>{listing.maxGuests} guests</span>
                        </div>
                      )}
                      {listing.rating > 0 && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span>{listing.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Images and Documents Preview */}
                    <div className="flex items-center space-x-3 mb-4">
                      {listing.images && listing.images.length > 0 && (
                        <button
                          onClick={() => openPreview('images', listing.images, listing.title)}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{listing.images.length} images</span>
                        </button>
                      )}
                      {listing.documents && listing.documents.length > 0 && (
                        <button
                          onClick={() => openPreview('documents', listing.documents, listing.title)}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{listing.documents.length} docs</span>
                        </button>
                      )}
                    </div>

                    {/* Host Info */}
                    <div className="flex items-center space-x-2 text-slate-600 min-w-0">
                      <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div className="text-sm min-w-0 flex-1">
                        <div className="font-medium truncate" title={listing.host?.username || listing.host?.name || listing.host?.email}>
                          Host: {truncateText(listing.host?.username || listing.host?.name || listing.host?.email, 18)}
                        </div>
                        {listing.host?.phone && (
                          <div className="text-slate-500 text-xs truncate" title={listing.host?.phone}>
                            {listing.host?.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7h8m-8 0v8a2 2 0 002 2h4a2 2 0 002-2V7m-8 0H6a2 2 0 00-2 2v8a2 2 0 002 2h1m5-10V9a2 2 0 00-2-2H8a2 2 0 00-2 2v2m4 0h4" />
                        </svg>
                        <span>ID: {listing._id}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal />

       <DocumentPreviewModal />
    </div>
  );
};

export default ApprovedListingsPage;