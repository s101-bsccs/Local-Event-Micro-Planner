import { EventItem } from './event.model';
import { UserProfile } from './user.model';

export interface DashboardResponse {
  user: UserProfile;
  myEvents: EventItem[];
  joinedEvents: EventItem[];
  favoriteEvents: EventItem[];
  personalStats: {
    totalEventsCreated: number;
    totalJoinedEvents: number;
    totalRsvps: number;
    totalBookmarks: number;
  };
  globalStats: {
    totalEvents: number;
    totalRsvps: number;
  };
}
