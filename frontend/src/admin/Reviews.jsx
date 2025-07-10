

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

const ReviewsTable = () => {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const type = user?.hostType?.[0] || "hotel";

  const getApiUrl = () => {
    const base = "http://localhost:4000/api";
    if (type === "hotel") return `${base}/host/dashboard/reviews`;
    if (type === "services") return `${base}/services/dashboard/reviews`;
    if (type === "experiences") return `${base}/experiences/dashboard/reviews`;
    return "";
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(getApiUrl(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) fetchReviews();
  }, [token, user, type]);

  return (
    <div className="p-4 h-screen">
      <h2 className="text-xl font-bold mb-4 capitalize">
        {type} Reviews
      </h2>

      {loading ? (
        <div className="text-gray-500 text-center py-10">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No reviews received yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="p-4 border rounded-lg shadow-sm bg-white/80"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{review.user?.username || "Anonymous"}</h3>
                <span className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), "dd MMM yyyy")}
                </span>
              </div>

              <div className="flex items-center mt-1 mb-2">
                {Array.from({ length: review.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4 text-yellow-500 fill-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsTable;
