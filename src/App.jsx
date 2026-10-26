
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import useFetchPhotos from './hooks/useFetchPhotos'

// Load saved favourites when the app starts
function getInitialFavourites() {
  try {
    const saved = localStorage.getItem('favouritePhotos')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Manage favourites using useReducer
function favouritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_FAVOURITE': {
      const alreadyFavourite = state.some(
        (photo) => photo.id === action.photo.id
      )

      if (alreadyFavourite) {
        return state.filter((photo) => photo.id !== action.photo.id)
      }

      return [...state, action.photo]
    }

    default:
      return state
  }
}

function App() {
  const { photos, loading, error } = useFetchPhotos()
  const [search, setSearch] = useState('')

  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    undefined,
    getInitialFavourites
  )

  // Save favourites whenever they change
  useEffect(() => {
    localStorage.setItem('favouritePhotos', JSON.stringify(favourites))
  }, [favourites])

  // Keep the search handler stable between renders
  const handleSearch = useCallback((event) => {
    setSearch(event.target.value)
  }, [])

  // Filter already-fetched photos without another API request
  const filteredPhotos = useMemo(() => {
    const query = search.trim().toLowerCase()

    return photos.filter((photo) =>
      photo.author.toLowerCase().includes(query)
    )
  }, [photos, search])

  function toggleFavourite(photo) {
    dispatch({
      type: 'TOGGLE_FAVOURITE',
      photo,
    })
  }

  function isFavourite(photoId) {
    return favourites.some((photo) => photo.id === photoId)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Photo Gallery
          </p>

          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
            Discover beautiful photos
          </h1>

          <p className="mt-3 text-slate-500">
            Explore photos and save your favourites.
          </p>

          <div className="mt-6">
            <label
              htmlFor="photo-search"
              className="block text-sm font-medium mb-2"
            >
              Search by author
            </label>

            <input
              id="photo-search"
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Try typing an author name..."
              className="w-full max-w-xl rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            {loading
              ? 'Loading photos...'
              : `${filteredPhotos.length} photos found · ${favourites.length} favourites`}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"
              role="status"
              aria-label="Loading photos"
            />
            <p className="mt-4 text-slate-600">Loading your gallery...</p>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            <p className="font-semibold">Unable to load photos</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && filteredPhotos.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold">No photos found</h2>
            <p className="mt-2 text-slate-500">
              Try searching for a different author name.
            </p>
          </div>
        )}

        {!loading && !error && filteredPhotos.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPhotos.map((photo) => {
              const favourite = isFavourite(photo.id)

              return (
                <article
                  key={photo.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src={`https://picsum.photos/id/${photo.id}/500/350`}
                    alt={`Photo by ${photo.author}`}
                    loading="lazy"
                    className="h-56 w-full object-cover"
                  />

                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Photographer
                      </p>
                      <h2 className="mt-1 truncate font-semibold">
                        {photo.author}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavourite(photo)}
                      aria-label={
                        favourite
                          ? `Remove ${photo.author} photo from favourites`
                          : `Add ${photo.author} photo to favourites`
                      }
                      aria-pressed={favourite}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                        favourite
                          ? 'border-rose-200 bg-rose-50 text-rose-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-500'
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill={favourite ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-6 w-6"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                        />
                      </svg>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-sm text-slate-500">
        Photo Gallery · Powered by Picsum Photos
      </footer>
    </div>
  )
}

export default App
