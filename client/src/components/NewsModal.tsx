import React from 'react';
import { Calendar, X, Star, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNews } from '../stores/useNews';

export default function NewsModal() {
  const { showNewsModal, selectedArticle, setShowNewsModal, setSelectedArticle } = useNews();

  const handleClose = () => {
    setShowNewsModal(false);
    setSelectedArticle(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!selectedArticle) return null;

  return (
    <Dialog open={showNewsModal} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              {selectedArticle.type === 'feature' ? (
                <Star className="w-5 h-5 text-yellow-400" />
              ) : (
                <FileText className="w-5 h-5 text-gray-400" />
              )}
              {selectedArticle.title}
            </DialogTitle>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              {formatDate(selectedArticle.createdAt)}
            </div>
            <Badge 
              variant={selectedArticle.type === 'feature' ? 'default' : 'secondary'}
              className={selectedArticle.type === 'feature' 
                ? 'bg-yellow-600/20 text-yellow-400' 
                : 'bg-gray-600/20 text-gray-400'
              }
            >
              {selectedArticle.type === 'feature' ? 'Featured' : 'Update'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <div className="prose prose-invert max-w-none">
            {selectedArticle.content.split('\n').map((paragraph, index) => (
              <p key={index} className="text-gray-300 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
          <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}