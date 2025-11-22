import { trpc } from "@/lib/trpc";
import { Button } from "./ui/button";
import { Bell, Check, CheckCheck } from "lucide-react";
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

export function NotificationsDropdown() {
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  
  const { data: notifications } = trpc.forum.getNotifications.useQuery();
  const { data: unreadCount } = trpc.forum.getUnreadCount.useQuery();
  
  const markReadMutation = trpc.forum.markNotificationRead.useMutation({
    onSuccess: () => {
      utils.forum.getNotifications.invalidate();
      utils.forum.getUnreadCount.invalidate();
    },
  });
  
  const markAllReadMutation = trpc.forum.markAllNotificationsRead.useMutation({
    onSuccess: () => {
      utils.forum.getNotifications.invalidate();
      utils.forum.getUnreadCount.invalidate();
    },
  });
  
  const getNotificationText = (notification: any) => {
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
  
  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markReadMutation.mutate({ notificationId: notification.id });
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
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
      
      <DropdownMenuContent align="end" className="w-80">
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
            {notifications.map((notification) => (
              <Link 
                key={notification.id} 
                href={`/forum/topic/${notification.topic_id}`}
              >
                <DropdownMenuItem
                  className={`cursor-pointer ${!notification.is_read ? 'bg-muted/50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-1">
                    <p className="text-sm">
                      {getNotificationText(notification)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.created_at && formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
