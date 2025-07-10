import Slider from "react-slick";

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
};

return (
  <>
    {/* Mobile Slider */}
    <div className="block lg:hidden mb-10 rounded-xl overflow-hidden">
      <Slider {...sliderSettings}>
        {hotel.images?.slice(0, 5).map((img, idx) => (
          <div key={idx}>
            <img
              src={img}
              alt={`hotel-slide-${idx}`}
              className="w-full h-72 object-cover rounded-xl"
            />
          </div>
        ))}
      </Slider>
    </div>

    {/* Desktop Grid */}
    <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-2 h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-10">
      <div className="col-span-2 row-span-2">
        <img
          src={hotel.images?.[0]}
          alt="Main"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
      {hotel.images?.slice(1, 5).map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`hotel-${idx}`}
          className="w-full h-full object-cover rounded-xl"
        />
      ))}
    </div>
  </>
);
