import { api } from './api';

export interface Video {
  title: string;
  subject: string;
  topic: string;
  url: string;
}

export interface VideoResponse {
  videos: Video[];
}

export const videoService = {
  /**
   * Get relevant YouTube videos for a subject and topic
   * @param subject The subject name (e.g., 'Math')
   * @param topic The topic name (e.g., 'Calculus')
   */
  getYoutubeVideos: async (subject: string, topic: string): Promise<VideoResponse> => {
    try {
      const response = await api.get<VideoResponse>('/student/youtube', {
        params: { subject, topic },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      // Return a basic fallback search link if the API fails
      return {
        videos: [
          {
            title: `Search YouTube for "${subject} ${topic}"`,
            subject,
            topic,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subject} ${topic}`)}`,
          },
        ],
      };
    }
  },
};
