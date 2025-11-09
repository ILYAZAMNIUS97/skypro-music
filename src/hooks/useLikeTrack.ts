import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addLikedTracks, removeLikedTracks } from '@/store/tracksSlice';
import { addLike, removeLike, withReauth } from '@/utils/api';
import type { Track } from '@/types/track';
import type { AppDispatch } from '@/store/store';

type TrackType = Track;

type ReturnTypeHook = {
  isLoading: boolean;
  errorMsg: string | null;
  toggleLike: () => void;
  isLike: boolean;
};

export const useLikeTrack = (track: TrackType | null): ReturnTypeHook => {
  const { favoriteTracks } = useAppSelector((state) => state.tracks);
  const { access, refresh } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const isLike = favoriteTracks.some((t) => t.trackId === track?.trackId);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleLike = () => {
    if (!access) {
      return setErrorMsg('Нет авторизации');
    }

    const actionApi = isLike ? removeLike : addLike;
    const actionSlice = isLike ? removeLikedTracks : addLikedTracks;

    setIsLoading(true);
    setErrorMsg(null);
    if (track) {
      withReauth(
        (newToken) => actionApi(newToken || access, track.trackId || ''),
        refresh,
        dispatch as AppDispatch,
      )
        .then(() => {
          dispatch(actionSlice(track));
        })
        .catch((error) => {
          if (error instanceof Error) {
            setErrorMsg(error.message);
          } else if (
            error &&
            typeof error === 'object' &&
            'response' in error &&
            (error as { response?: Response }).response instanceof Response
          ) {
            const response = (error as { response: Response }).response;
            if (response.status === 401) {
              setErrorMsg('Требуется авторизация');
            } else {
              setErrorMsg('Произошла ошибка. Попробуйте позже');
            }
          } else {
            setErrorMsg('Произошла ошибка. Попробуйте позже');
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return {
    isLoading,
    errorMsg,
    toggleLike,
    isLike,
  };
};
