import { trpc } from "@/lib/trpc";
import { Button } from "./ui/button";
import { Bell, Check, CheckCheck, BookOpen, Trophy, MessageSquare, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

export function NotificationsDropdown() {
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const previousUnreadCount = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Polling: refetch every 60 seconds
  const { data: notifications } = trpc.notifications.getNotifications.useQuery(undefined, {
    refetchInterval: 60000, // 60 seconds
  });
  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 60000, // 60 seconds
  });
  
  // Initialize audio
  useEffect(() => {
    // Create a simple notification sound using Web Audio API
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };
    
    audioRef.current = { play: createNotificationSound } as any;
  }, []);
  
  // Detect new notifications and show toast
  useEffect(() => {
    if (unreadCount && previousUnreadCount.current > 0) {
      const newCount = unreadCount.count - previousUnreadCount.current;
      
      if (newCount > 0) {
        // Trigger animation
        setHasNewNotification(true);
        setTimeout(() => setHasNewNotification(false), 1000);
        
        // Play sound
        if (audioRef.current) {
          try {
            (audioRef.current as any).play();
          } catch (e) {
            console.log('Audio play failed:', e);
          }
        }
        
        // Show toast for the latest notification
        if (notifications && notifications.length > 0) {
          const latestNotification = notifications[0];
          toast.info(latestNotification.title, {
            description: latestNotification.message,
            duration: 5000,
            icon: getNotificationIcon(latestNotification.type || latestNotification.notification_type),
          });
        }
      }
    }
    
    if (unreadCount) {
      previousUnreadCount.current = unreadCount.count;
    }
  }, [unreadCount, notifications]);
  
  const markReadMutation = trpc.notifications.markNotificationRead.useMutation({
    onSuccess: () => {
      utils.notifications.getNotifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });
  
  const markMultipleReadMutation = trpc.notifications.markNotificationsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getNotifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });
  
  const markAllReadMutation = trpc.notifications.markAllNotificationsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getNotifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });
  
  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      if (notification.count > 1 && notification.notification_ids) {
        // Multiple notifications - mark all as read
        markMultipleReadMutation.mutate({ notificationIds: notification.notification_ids });
      } else {
        // Single notification - mark one as read
        markReadMutation.mutate({ notificationId: notification.id });
      }
    }
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    if (type.includes('exam')) return <BookOpen className="h-4 w-4 text-blue-500" />;
    if (type.includes('achievement') || type.includes('milestone')) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (type.includes('vocab')) return <Sparkles className="h-4 w-4 text-green-500" />;
    if (type.includes('forum') || type.includes('reply') || type.includes('upvote')) return <MessageSquare className="h-4 w-4 text-purple-500" />;
    return <Bell className="h-4 w-4 text-gray-500" />;
  };
  
  // Get notification text (for old forum notifications)
  const getNotificationText = (notification: any) => {
    // If it has a title, use it (new unified notifications)
    if (notification.title) {
      return notification.title;
    }
    
    // Fallback for old forum notifications
    const userName = notification.from_user_name || t.someone || "Someone";
    
    switch (notification.notification_type) {
      case "reply_to_topic":
        return `${userName} ${t.repliedToYourTopic || "replied to your topic"}`;
      case "upvote_topic":
        return `${userName} ${t.upvotedYourTopic || "upvoted your topic"}`;
      case "upvote_post":
        return `${userName} ${t.upvotedYourPost || "upvoted your post"}`;
      default:
        return notification.notification_type;
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={`h-5 w-5 transition-transform ${hasNewNotification ? 'animate-bounce' : ''}`} />
          {unreadCount && unreadCount.count > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount.count > 9 ? "9+" : unreadCount.count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <div className="flex items-center justify-between px-2 py-2">
          <h3 className="font-semibold">{t.notifications || "Notifications"}</h3>
          {unreadCount && unreadCount.count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              {t.markAllRead || "Mark all read"}
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        {!notifications || notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            {t.noNotifications || "No notifications"}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const actionUrl = notification.action_url || 
                (notification.topic_id ? `/forum/topic/${notification.topic_id}` : '#');
              
              // Check if notification type is 'rating' - these should not navigate
              const isRatingNotification = (notification.type || notification.notification_type) === 'rating';
              
              const menuItem = (
                <DropdownMenuItem
                  key={notification.id}
                  className={`cursor-pointer ${!notification.is_read ? 'bg-muted/50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                    <div className="flex gap-3 items-start flex-1">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type || notification.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {getNotificationText(notification)}
                          </p>
                          {notification.count > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              {notification.count}
                            </Badge>
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.created_at && formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="ml-2 h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                </DropdownMenuItem>
              );
              
              // Wrap in Link only if it's not a rating notification
              return isRatingNotification ? menuItem : (
                <Link key={notification.id} href={actionUrl}>
                  {menuItem}
                </Link>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
