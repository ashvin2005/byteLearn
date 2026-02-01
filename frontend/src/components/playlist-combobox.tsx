"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface PlaylistData {
  article_ids: string[];
  description?: string;
  cover_image?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover_image?: string;
  article_count: number;
  is_public: boolean;
  updated_at: string;
  created_at: string;
  article_ids: string[];
}

interface PlaylistComboboxProps {
  onClose: () => void;
  articleId: string;
}

export function PlaylistCombobox({ onClose, articleId }: PlaylistComboboxProps) {
  const [playlists, setPlaylists] = React.useState<Playlist[]>([])
  const { user } = useAuth()
  const comboboxRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        if (!user?.id) {
          return
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("playlists")
          .eq("user_id", user.id)
          .maybeSingle()

        if (userError) {
          console.error("Error fetching user playlists:", userError)
          return
        }

        if (!userData || !userData.playlists) {
          setPlaylists([])
          return
        }

        const playlistsData = userData.playlists as Record<string, PlaylistData>
        const formattedPlaylists: Playlist[] = Object.entries(playlistsData).map(([name, data]) => ({
          id: name,
          name,
          description: data.description || "",
          cover_image: data.cover_image || "",
          article_count: data.article_ids?.length || 0,
          is_public: data.is_public,
          updated_at: data.updated_at,
          created_at: data.created_at,
          article_ids: data.article_ids || [],
        }))

        setPlaylists(formattedPlaylists)
      } catch (err) {
        console.error("Error fetching playlists:", err)
      }
    }

    fetchPlaylists()
  }, [user?.id])

  const handlePlaylistSelect = async (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (!user?.id) return

      // Get current playlists data
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("playlists")
        .eq("user_id", user.id)
        .maybeSingle()

      if (fetchError) {
        console.error("Error fetching playlists:", fetchError)
        return
      }

      if (!userData || !userData.playlists) return

      const playlistsData = userData.playlists as Record<string, PlaylistData>
      
      // Check if article is already in the playlist
      if (playlistsData[playlist.id].article_ids?.includes(articleId)) {
        toast.error("Article already in playlist")
        return
      }

      // Add article to the playlist
      playlistsData[playlist.id] = {
        ...playlistsData[playlist.id],
        article_ids: [...(playlistsData[playlist.id].article_ids || []), articleId],
        updated_at: new Date().toISOString()
      }

      // Update in Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({ playlists: playlistsData })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("Error updating playlist:", updateError)
        toast.error("Failed to add article to playlist")
        return
      }

      toast.success("Successfully added to playlist")
      onClose()
    } catch (err) {
      console.error("Error adding to playlist:", err)
      toast.error("Failed to add article to playlist")
    }
  }

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <div 
      ref={comboboxRef}
      className="absolute right-0 top-8 z-50 flex flex-col gap-1 p-2 bg-black w-[200px] rounded-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-white/50 text-sm font-medium px-2 py-1">Select Playlist</p>
      <div className="flex flex-col gap-1">
        {playlists.map((playlist) => (
          <button
            key={playlist.id}
            className="px-2 py-1 text-left text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200"
            onClick={(e) => handlePlaylistSelect(playlist, e)}
          >
            {playlist.name}
          </button>
        ))}
      </div>
    </div>
  )
} 
