import { UserSummary } from './user.model';

export interface EventItem {
  _id?: string;
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  city: string;
  capacity: number;
  createdBy: UserSummary;
  attendees: UserSummary[];
  attendeeIds: string[];
  attendeesCount: number;
  availableSpots: number;
  isFull: boolean;
  isBookmarked: boolean;
  canEdit: boolean;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export interface EventFilters {
  category: string;
  city: string;
  date: string;
  status: string;
  search: string;
}

export interface SuggestionResponse {
  recommendedTime: string;
  popularCategories: string[];
}

export interface EventFeedResponse {
  events: EventItem[];
  filters: {
    categories: string[];
    cities: string[];
  };
  suggestions: SuggestionResponse;
  analytics: {
    totalEvents: number;
    totalRsvps: number;
  };
}

export interface EventFormPayload {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  city: string;
  capacity: number;
}
