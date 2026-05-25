import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicPreviousEvents } from '../store/slices/publicEventsSlice';
import ImageViewer from './ImageViewer';
import { Autoplay, Navigation, Pagination, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import EmptyState from './EmptyState';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './PreviousEventsGallery.css';

const AUTOPLAY_DELAY_MS = 2500;

function CarouselNavIcon({ direction }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === 'prev' ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

export default function PreviousEventsGallery() {
  const dispatch = useDispatch();
  const { previous: items, loadingPrevious: loading } = useSelector((state) => state.publicEvents);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    dispatch(fetchPublicPreviousEvents());
  }, [dispatch]);

  if (loading) {
    return <p className="events-gallery__empty">Loading gallery…</p>;
  }

  if (!items.length) {
    return <EmptyState message="No previous events in the gallery" />;
  }

  const canLoop = items.length > 1;

  return (
    <div className="pe-carousel" aria-roledescription="carousel" aria-label="Previous events gallery">
      <div className="pe-carousel__frame">
        <button
          type="button"
          ref={prevRef}
          className="pe-carousel__nav pe-carousel__nav--prev"
          aria-label="Previous slide"
        >
          <CarouselNavIcon direction="prev" />
        </button>

        <Swiper
          className="pe-carousel__swiper"
          modules={[Autoplay, Navigation, Pagination, A11y]}
          slidesPerView={1}
          centeredSlides
          spaceBetween={16}
          speed={650}
          loop={canLoop}
          grabCursor
          watchSlidesProgress
          autoplay={
            canLoop
              ? {
                  delay: AUTOPLAY_DELAY_MS,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          pagination={{
            el: paginationRef.current,
            clickable: true,
            dynamicBullets: items.length > 5,
          }}
          breakpoints={{
            520: { slidesPerView: 1.12, spaceBetween: 20 },
            768: { slidesPerView: 1.28, spaceBetween: 24 },
            1024: { slidesPerView: 1.4, spaceBetween: 28 },
          }}
          onBeforeInit={(swiper) => {
            if (typeof swiper.params.navigation !== 'boolean') {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }
            if (typeof swiper.params.pagination !== 'boolean') {
              swiper.params.pagination.el = paginationRef.current;
            }
          }}
          onSwiper={(swiper) => {
            setTimeout(() => {
              if (swiper && swiper.params && !swiper.destroyed) {
                if (typeof swiper.params.navigation !== 'boolean') {
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                  swiper.navigation?.init();
                  swiper.navigation?.update();
                }
                if (typeof swiper.params.pagination !== 'boolean') {
                  swiper.params.pagination.el = paginationRef.current;
                  swiper.pagination?.init();
                  swiper.pagination?.render();
                  swiper.pagination?.update();
                }
              }
            });
          }}
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className="pe-carousel__slide-wrap">
              <figure className="pe-carousel__slide">
                <div className="pe-carousel__media">
                  {item.image_url ? (
                    <button
                      type="button"
                      className="pe-carousel__media-btn"
                      onClick={() =>
                        setLightbox({
                          src: item.image_url,
                          alt: item.caption || item.category || 'Past event',
                        })
                      }
                      aria-label="View full image"
                    >
                      <img
                        src={item.image_url}
                        alt={item.caption || item.category || 'Past event'}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ) : (
                    <div className="pe-carousel__placeholder" aria-hidden="true" />
                  )}
                </div>
                {(item.category || item.caption) && (
                  <figcaption className="pe-carousel__caption">
                    {item.category && (
                      <span className="pe-carousel__category">{item.category}</span>
                    )}
                    {item.caption && <p className="pe-carousel__text">{item.caption}</p>}
                  </figcaption>
                )}
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          ref={nextRef}
          className="pe-carousel__nav pe-carousel__nav--next"
          aria-label="Next slide"
        >
          <CarouselNavIcon direction="next" />
        </button>
      </div>

      <div ref={paginationRef} className="pe-carousel__pagination" />

      {lightbox && (
        <ImageViewer
          imageSrc={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
