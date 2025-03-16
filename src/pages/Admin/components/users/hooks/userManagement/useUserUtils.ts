
import { User } from "../useUserForm";

export const useUserUtils = () => {
  const getFullName = (user: User) => {
    if (user.display_name) return user.display_name;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    return "-";
  };

  const isUserSuspended = (user: User): boolean => {
    if (!user.banned_until) return false;
    const bannedUntil = new Date(user.banned_until);
    return bannedUntil > new Date();
  };

  return {
    getFullName,
    isUserSuspended
  };
};
