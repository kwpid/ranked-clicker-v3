import React from 'react';
import { ArrowLeft, Calendar, Star, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useNews } from '../stores/useNews';
import { useGameState } from '../stores/useGameState';

export default function NewsScreen() {
  const { setCurrentScreen } = useGameState();
  const { 
    articles, 
    versionInfo, 
    markAsRead, 
    getFeaturedArticles, 
    getRegularArticles,
    setSelectedArticle,
    setShowNewsModal
  } = useNews();

  const featuredArticles = getFeaturedArticles();
  const regularArticles = getRegularArticles();

  const handleArticleClick = (article: any) => {
    markAsRead(article.id);
    setSelectedArticle(article);
    setShowNewsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setCurrentScreen('main')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              News & Updates
            </h1>
          </div>

          {/* Version Info */}
          {versionInfo.hasUpdate && (
            <Badge variant="destructive" className="animate-pulse">
              Update Available: v{versionInfo.latestVersion}
            </Badge>
          )}
        </div>

        {/* Update Notification */}
        {versionInfo.hasUpdate && (
          <Card className="bg-yellow-900/20 border-yellow-500/30 mb-6">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="font-semibold text-yellow-400">
                    New version available: v{versionInfo.latestVersion}
                  </p>
                  <p className="text-sm text-yellow-300/80">
                    Current version: v{versionInfo.currentVersion}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.open('https://github.com/user/ranked-clicker-game/releases', '_blank')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                View Update
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Articles */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold">Featured</h2>
            </div>
            
            <div className="space-y-4">
              {featuredArticles.map((article) => (
                <Card 
                  key={article.id}
                  className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all cursor-pointer"
                  onClick={() => handleArticleClick(article)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        {!article.readByUser && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        )}
                        {article.title}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400">
                        Featured
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {article.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Regular Articles Sidebar */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold">Updates</h2>
            </div>

            <div className="space-y-3">
              {regularArticles.map((article) => (
                <Card 
                  key={article.id}
                  className="bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 transition-all cursor-pointer"
                  onClick={() => handleArticleClick(article)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                      {!article.readByUser && (
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      )}
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                      {article.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* No articles message */}
        {articles.length === 0 && (
          <Card className="bg-gray-800/30 border-gray-700 mt-8">
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                No news articles yet
              </h3>
              <p className="text-gray-500">
                Check back later for game updates and announcements!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}