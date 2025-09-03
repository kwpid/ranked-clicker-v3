import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  type: 'feature' | 'regular';
  isPublished: boolean;
  createdAt: string;
  readByUser?: boolean;
}

export interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  lastChecked: number;
  updateDismissed?: boolean;
}

interface NewsStore {
  articles: NewsArticle[];
  versionInfo: VersionInfo;
  showNewsModal: boolean;
  selectedArticle: NewsArticle | null;
  
  // News actions
  setArticles: (articles: NewsArticle[]) => void;
  markAsRead: (articleId: string) => void;
  addArticle: (article: Omit<NewsArticle, 'id'>) => void;
  setShowNewsModal: (show: boolean) => void;
  setSelectedArticle: (article: NewsArticle | null) => void;
  
  // Version actions
  setVersionInfo: (info: VersionInfo) => void;
  checkForUpdates: () => Promise<void>;
  dismissUpdate: () => void;
  
  // Utilities
  getUnreadCount: () => number;
  getFeaturedArticles: () => NewsArticle[];
  getRegularArticles: () => NewsArticle[];
}

export const useNews = create<NewsStore>()(
  persist(
    (set, get) => ({
      articles: [
        {
          id: '1',
          title: 'Welcome to Ranked Clicker!',
          content: 'Welcome to the ultimate competitive clicking experience! Compete in 1v1, 2v2, and 3v3 matches across multiple ranks from Bronze to Grand Champion. Earn titles, climb the seasonal leaderboards, and prove your clicking skills!',
          type: 'feature',
          isPublished: true,
          createdAt: new Date().toISOString(),
          readByUser: false,
        },
        {
          id: '2',
          title: 'New Tournament System Released',
          content: 'Tournaments are now live! Compete in bracket-style competitions for exclusive tournament titles. Win multiple tournaments in a season to unlock special golden title variants.',
          type: 'feature',
          isPublished: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          readByUser: false,
        },
        {
          id: '3',
          title: 'Bug Fixes and Improvements',
          content: 'This update includes various bug fixes and performance improvements:\n• Fixed Grand Champion title colors\n• Improved AI clicking patterns\n• Reduced queue times across all ranks\n• Added MMR display during matches',
          type: 'regular',
          isPublished: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          readByUser: false,
        }
      ],
      versionInfo: {
        currentVersion: '1.0.0',
        latestVersion: '1.0.0',
        hasUpdate: false,
        lastChecked: 0,
        updateDismissed: false,
      },
      showNewsModal: false,
      selectedArticle: null,

      setArticles: (articles) => set({ articles }),
      
      markAsRead: (articleId) => set((state) => ({
        articles: state.articles.map(article =>
          article.id === articleId
            ? { ...article, readByUser: true }
            : article
        ),
      })),

      addArticle: (article) => set((state) => ({
        articles: [
          {
            ...article,
            id: Date.now().toString(),
          },
          ...state.articles,
        ],
      })),

      setShowNewsModal: (show) => set({ showNewsModal: show }),
      setSelectedArticle: (article) => set({ selectedArticle: article }),

      setVersionInfo: (info) => set({ versionInfo: info }),

      checkForUpdates: async () => {
        try {
          // Check GitHub API for the latest release
          const response = await fetch('https://api.github.com/repos/user/ranked-clicker-game/releases/latest');
          if (response.ok) {
            const data = await response.json();
            const latestVersion = data.tag_name?.replace('v', '') || '1.0.0';
            const currentVersion = get().versionInfo.currentVersion;
            
            const hasUpdate = latestVersion !== currentVersion && !get().versionInfo.updateDismissed;
            
            set({
              versionInfo: {
                currentVersion,
                latestVersion,
                hasUpdate,
                lastChecked: Date.now(),
                updateDismissed: get().versionInfo.updateDismissed,
              }
            });
          }
        } catch (error) {
          console.log('Could not check for updates:', error);
          // Silently fail - this is not critical functionality
        }
      },

      dismissUpdate: () => set((state) => ({
        versionInfo: {
          ...state.versionInfo,
          hasUpdate: false,
          updateDismissed: true,
        }
      })),

      getUnreadCount: () => {
        const { articles } = get();
        return articles.filter(article => article.isPublished && !article.readByUser).length;
      },

      getFeaturedArticles: () => {
        const { articles } = get();
        return articles.filter(article => article.type === 'feature' && article.isPublished);
      },

      getRegularArticles: () => {
        const { articles } = get();
        return articles.filter(article => article.type === 'regular' && article.isPublished);
      },
    }),
    {
      name: 'news-storage',
      partialize: (state) => ({
        articles: state.articles,
        versionInfo: state.versionInfo,
      }),
    }
  )
);