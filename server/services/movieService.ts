import axios from "axios";
import { supabase } from "./supabaseClient";
import { Database } from "../utils/databaseTypes";
import { syncSharedFavorites } from "./sharedFavoritesService";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Funções de requisição à API do The Movie Database
export const getMovies = async (query: string, page: number) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        page,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to fetch movies: ${(error as Error).message}`);
  }
};

export const getMovieDetails = async (movieId: number) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch movie details: ${(error as Error).message}`
    );
  }
};

export const getTrendingMovies = async (time: string) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/trending/movie/${time}`,
      {
        params: {
          api_key: TMDB_API_KEY,
        },
      }
    );
    return response.data.results;
  } catch (error) {
    throw new Error(
      `Failed to fetch trending movies: ${(error as Error).message}`
    );
  }
};

type FavoriteRow = Database["public"]["Tables"]["favorites"]["Row"];
// Funções de requisição ao banco de dados
export const addFavorite = async (
  userId: string,
  movieId: number,
  title: string,
  poster_path: string
): Promise<FavoriteRow | string> => {
  const { data: existingFavorite, error: checkError } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .eq("movie_id", movieId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw checkError;
  }

  if (existingFavorite) {
    return "Este filme já está na lista de favoritos.";
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, movie_id: movieId, title, poster_path })
    .single();

  if (error) throw error;
  try {
    await syncSharedFavorites(userId);
  } catch (error) {
    throw error;
  }
  return data as FavoriteRow;
};

export const getFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
};

export const deleteFavorite = async (userId: string, movieId: string) => {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", movieId);
  if (error) throw error;

  try {
    await syncSharedFavorites(userId);
  } catch (error) {
    throw error;
  }
};
