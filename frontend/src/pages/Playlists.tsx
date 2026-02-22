import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  ArrowLeft,
  Edit,
  X,
  Trash2,
  Check,
  AlertCircle,
  Bookmark,
  ListPlus,
} from "lucide-react";

// The JSON structure in Supabase users.playlists
interface PlaylistsData {
  [playlistName: string]: {
    article_ids: string[];
    description?: string;
    cover_image?: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface PlaylistData {
  id: string; // This is the playlist name serving as the identifier
  name: string;
  description?: string;
  cover_image?: string;
  article_count: number;
  is_public: boolean;
  updated_at: string;
  created_at: string;
  article_ids: string[];
}

const Playlists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [playlistToEdit, setPlaylistToEdit] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [newPlaylistCoverImage, setNewPlaylistCoverImage] = useState("");
  const [newPlaylistIsPublic, setNewPlaylistIsPublic] = useState(true);
  const [nameError, setNameError] = useState("");
  const [coverImageError, setCoverImageError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch playlists from Supabase
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("playlists")
          .eq("user_id", user.id)
          .maybeSingle();

        if (userError) {
          throw userError;
        }

        if (!userData || !userData.playlists) {
          setPlaylists([]);
          setLoading(false);
          return;
        }

        const playlistsData = userData.playlists as PlaylistsData;

        const formattedPlaylists: PlaylistData[] = Object.entries(
          playlistsData
        ).map(([name, data]) => ({
          id: name, // Use the name as ID
          name,
          description: data.description || "",
          cover_image: data.cover_image || "",
          article_count: data.article_ids?.length || 0,
          is_public: data.is_public,
          updated_at: data.updated_at,
          created_at: data.created_at,
          article_ids: data.article_ids || [],
        }));

        setPlaylists(formattedPlaylists);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [user?.id]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  // Open create playlist modal
  const openCreateModal = () => {
    setModalMode("create");
    setPlaylistToEdit(null);
    setNewPlaylistName("");
    setNewPlaylistDescription("");
    setNewPlaylistCoverImage("");
    setNewPlaylistIsPublic(true);
    setNameError("");
    setCoverImageError("");
    setShowModal(true);
  };

  // Open edit playlist modal
  const openEditModal = (playlist: PlaylistData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setModalMode("edit");
    setPlaylistToEdit(playlist.id);
    setNewPlaylistName(playlist.name);
    setNewPlaylistDescription(playlist.description || "");
    setNewPlaylistCoverImage(playlist.cover_image || "");
    setNewPlaylistIsPublic(playlist.is_public);
    setNameError("");
    setCoverImageError("");
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    if (submitLoading) return; // Don't close if submitting
    setShowModal(false);
    setShowDeleteConfirm(false);
  };

  // Validate image URL
  const validateImageUrl = async (url: string): Promise<boolean> => {
    if (!url) return true; // Empty URL is valid

    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentType = response.headers.get("content-type");
      return contentType ? contentType.startsWith("image/") : false;
    } catch {
      return false;
    }
  };

  // Check if playlist name exists
  const checkPlaylistExists = (name: string): boolean => {
    if (
      modalMode === "edit" &&
      name === playlists.find((p) => p.id === playlistToEdit)?.name
    ) {
      return false; // Same name for edited playlist is fine
    }

    return playlists.some(
      (playlist) => playlist.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Create or update playlist
  const handleSubmitPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setCoverImageError("");

    // Validate name
    if (!newPlaylistName.trim()) {
      setNameError("Playlist name is required");
      return;
    }

    // Check if playlist name already exists (for create)
    if (modalMode === "create" && checkPlaylistExists(newPlaylistName)) {
      setNameError("A playlist with this name already exists");
      return;
    }

    // Validate image URL if provided
    if (newPlaylistCoverImage) {
      setSubmitLoading(true);
      const isValid = await validateImageUrl(newPlaylistCoverImage);
      setSubmitLoading(false);

      if (!isValid) {
        setCoverImageError(
          "Invalid image URL. Please provide a valid image link."
        );
        return;
      }
    }

    setSubmitLoading(true);

    try {
      // Get current playlists
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("playlists")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const currentPlaylists: PlaylistsData = userData?.playlists || {};

      const now = new Date().toISOString();

      if (modalMode === "create") {
        // Add new playlist
        currentPlaylists[newPlaylistName] = {
          article_ids: [],
          description: newPlaylistDescription || undefined,
          cover_image: newPlaylistCoverImage || undefined,
          is_public: newPlaylistIsPublic,
          created_at: now,
          updated_at: now,
        };
      } else if (modalMode === "edit" && playlistToEdit) {
        // For editing, if name changed, we need to create a new key and delete the old one
        const oldPlaylistData = currentPlaylists[playlistToEdit];

        if (oldPlaylistData) {
          // If name changed, delete old key and create new one
          if (newPlaylistName !== playlistToEdit) {
            // Create a new object with the updated name
            const articleIds = oldPlaylistData.article_ids || [];

            // Add the new playlist with the old article IDs
            currentPlaylists[newPlaylistName] = {
              article_ids: articleIds,
              description: newPlaylistDescription || undefined,
              cover_image: newPlaylistCoverImage || undefined,
              is_public: newPlaylistIsPublic,
              created_at: oldPlaylistData.created_at || now,
              updated_at: now,
            };

            // Then delete the old one
            delete currentPlaylists[playlistToEdit];
          } else {
            // Just update the existing playlist
            currentPlaylists[playlistToEdit] = {
              ...oldPlaylistData,
              article_ids: oldPlaylistData.article_ids || [],
              description: newPlaylistDescription || undefined,
              cover_image: newPlaylistCoverImage || undefined,
              is_public: newPlaylistIsPublic,
              updated_at: now,
            };
          }
        } else {
          // Edge case: the playlist to edit doesn't exist anymore
          console.warn("Playlist to edit not found:", playlistToEdit);
          // Create it as a new playlist
          currentPlaylists[newPlaylistName] = {
            article_ids: [],
            description: newPlaylistDescription || undefined,
            cover_image: newPlaylistCoverImage || undefined,
            is_public: newPlaylistIsPublic,
            created_at: now,
            updated_at: now,
          };
        }
      }

      // Update in Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({ playlists: currentPlaylists })
        .eq("user_id", user?.id);

      if (updateError) throw updateError;

      // Update local state
      if (modalMode === "create") {
        setPlaylists([
          ...playlists,
          {
            id: newPlaylistName,
            name: newPlaylistName,
            description: newPlaylistDescription,
            cover_image: newPlaylistCoverImage,
            article_count: 0,
            is_public: newPlaylistIsPublic,
            created_at: now,
            updated_at: now,
            article_ids: [],
          },
        ]);
      } else {
        setPlaylists(
          playlists.map((playlist) =>
            playlist.id === playlistToEdit
              ? {
                  id: newPlaylistName,
                  name: newPlaylistName,
                  description: newPlaylistDescription,
                  cover_image: newPlaylistCoverImage,
                  article_count: playlist.article_ids?.length || 0,
                  is_public: newPlaylistIsPublic,
                  created_at: playlist.created_at,
                  updated_at: now,
                  article_ids: playlist.article_ids || [],
                }
              : playlist
          )
        );
      }

      closeModal();
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlistToEdit || !user?.id) return;

    setSubmitLoading(true);

    try {
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("playlists")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!userData || !userData.playlists) {
        setSubmitLoading(false);
        closeModal();
        return;
      }

      const currentPlaylists: PlaylistsData = userData.playlists;

      if (!currentPlaylists[playlistToEdit]) {
        // Update local state anyway
        setPlaylists(
          playlists.filter((playlist) => playlist.id !== playlistToEdit)
        );
        closeModal();
        return;
      }

      delete currentPlaylists[playlistToEdit];

      const { error: updateError } = await supabase
        .from("users")
        .update({ playlists: currentPlaylists })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Update local state
      setPlaylists(
        playlists.filter((playlist) => playlist.id !== playlistToEdit)
      );

      closeModal();
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Check image on blur
  const handleImageBlur = async () => {
    if (newPlaylistCoverImage) {
      const isValid = await validateImageUrl(newPlaylistCoverImage);
      if (!isValid) {
        setCoverImageError(
          "Invalid image URL. Please provide a valid image link."
        );
      } else {
        setCoverImageError("");
      }
    } else {
      setCoverImageError("");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Please log in to view your playlists.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Loading playlists...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-11 text-[#D4D4D4]">
        Error loading playlists:
        <br />
        {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-gradient-to-br from-[#000000] to-[#0A0A0A] text-foreground">
      <div className="px-3 md:px-4 pt-8 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              My Article Playlists
            </h1>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-primary/90 hover:bg-primary rounded-full px-4 py-2 text-sm font-medium"
          >
            <ListPlus className="w-4 h-4" />
            Create Playlist
          </button>
        </div>

        <div className="grid gap-4 md:gap-4 lg:grid-cols-2 xl:grid-cols-2 w-full">
          {playlists.length === 0 ? (
            <div className="text-lg text-muted-foreground">
              No playlists found - create your first article collection!
            </div>
          ) : (
            playlists.map((playlist) => (
              <Link
                key={playlist.id}
                to={`/playlists/${playlist.id}`}
                className="group transition-all hover:shadow-lg duration-300"
              >
                <div className="group/card relative bg-gradient-to-b from-card to-card/90 text-card-foreground rounded-xl p-5 shadow-lg border border-border/40 backdrop-blur-sm hover:border-border/60 transition-all duration-300">
                  <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 z-10">
                    <button
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm"
                      onClick={(e) => openEditModal(playlist, e)}
                      aria-label="Edit playlist"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    children={undefined}
                  />
                  <div className="flex flex-col h-full gap-4">
                    <div className="relative w-full h-20 rounded-lg overflow-hidden">
                      <img
                        src={
                          playlist.cover_image ||
                          `https://placehold.co/400x200/333/FFF?text=${encodeURIComponent(
                            playlist.name
                          )}`
                        }
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, replace with placeholder
                          const target = e.target as HTMLImageElement;
                          target.src = `https://placehold.co/400x200/333/FFF?text=${encodeURIComponent(
                            playlist.name
                          )}`;
                        }}
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0 bg-muted/60 p-2 rounded-lg border">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <h2 className="text-2xl font-semibold truncate">
                        {playlist.name}
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="text-sm line-clamp-2 text-muted-foreground">
                        {playlist.description || "A collection of articles."}
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {playlist.article_count}{" "}
                          {playlist.article_count === 1
                            ? "article"
                            : "articles"}
                        </span>
                        <span className="font-medium text-muted-foreground">
                          {playlist.is_public ? "Public" : "Private"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium px-2.5 py-1 border bg-white/10 rounded-full">
                          Updated{" "}
                          {new Date(playlist.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div
            ref={modalRef}
            className="bg-card relative rounded-xl border border-border max-w-md w-full p-6 shadow-xl"
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-muted-foreground hover:text-white"
              disabled={submitLoading}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-6">
              {modalMode === "create" ? "Create New Playlist" : "Edit Playlist"}
            </h2>

            {showDeleteConfirm ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-sm">
                    Are you sure you want to delete this playlist? This action
                    cannot be undone.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-card/50 hover:bg-card/80 rounded-lg text-sm font-medium"
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePlaylist}
                    className="px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-sm font-medium flex items-center gap-2"
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Deleting..." : "Yes, Delete"}
                    {submitLoading && (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPlaylist} className="space-y-4">
                {/* Playlist Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Playlist Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => {
                      setNewPlaylistName(e.target.value);
                      setNameError("");
                    }}
                    className={`w-full px-3 py-2 bg-card/50 border ${
                      nameError ? "border-red-500" : "border-border/50"
                    } rounded-lg focus:outline-none focus:ring-1 focus:ring-primary`}
                    placeholder="Enter playlist name"
                    disabled={submitLoading}
                    required
                  />
                  {nameError && (
                    <p className="text-xs text-red-500">{nameError}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-card/50 border border-border/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter playlist description (optional)"
                    rows={3}
                    disabled={submitLoading}
                  />
                </div>

                {/* Cover Image URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={newPlaylistCoverImage}
                    onChange={(e) => {
                      setNewPlaylistCoverImage(e.target.value);
                      setCoverImageError("");
                    }}
                    onBlur={handleImageBlur}
                    className={`w-full px-3 py-2 bg-card/50 border ${
                      coverImageError ? "border-red-500" : "border-border/50"
                    } rounded-lg focus:outline-none focus:ring-1 focus:ring-primary`}
                    placeholder="https://example.com/image.jpg (optional)"
                    disabled={submitLoading}
                  />
                  {coverImageError && (
                    <p className="text-xs text-red-500">{coverImageError}</p>
                  )}
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Visibility
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={newPlaylistIsPublic}
                        onChange={() => setNewPlaylistIsPublic(true)}
                        disabled={submitLoading}
                      />
                      <span>Public</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!newPlaylistIsPublic}
                        onChange={() => setNewPlaylistIsPublic(false)}
                        disabled={submitLoading}
                      />
                      <span>Private</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  {modalMode === "edit" && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium flex items-center gap-2"
                      disabled={submitLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}

                  <div className={modalMode === "create" ? "ml-auto" : ""}>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary/80 hover:bg-primary rounded-lg text-sm font-medium flex items-center gap-2"
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        "Saving..."
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          {modalMode === "create"
                            ? "Create Playlist"
                            : "Save Changes"}
                        </>
                      )}
                      {submitLoading && (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
