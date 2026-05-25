import { useState, useEffect } from "react";
import { api } from "@/lib/api/apiClient";

export interface SearchUserResult {
  id: number;
  name: string;
  email: string;
  avatar: string;
  code?: string;
}

interface BackendUserResponse {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  studentId?: string;
  degree?: string;
}

export const useUserSearch = (query: string) => {
  const [users, setUsers] = useState<SearchUserResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setUsers([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const queryString = new URLSearchParams({
          keyword: trimmedQuery,
          size: "5",
        }).toString();

        const response = await api.get<any>(`/users/search?${queryString}`);

        const rawData: BackendUserResponse[] = Array.isArray(response)
          ? response
          : response.data || [];

        if (!isCancelled) {
          const mappedUsers: SearchUserResult[] = rawData.map((u) => ({
            id: u.id,
            name: u.fullName,
            email: u.email,
            avatar: u.avatarUrl || "",
            code: u.studentId || u.degree,
          }));

          setUsers(mappedUsers);
        }
      } catch (error) {
        if (!isCancelled) setUsers([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchUsers, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  return { users, loading };
};
