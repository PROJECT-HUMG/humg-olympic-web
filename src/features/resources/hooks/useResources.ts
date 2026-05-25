import { useState, useEffect, useCallback, useRef } from "react";
import { resourceRepository } from "@/features/resources/api";
import {
  ResourceItem,
  ResourceCategory,
  UploadResourceDTO,
  UpdateResourceDTO,
} from "@/features/resources/types/resources.types";

export const useResources = (initialLimit: number = 9) => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<number | string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const categoriesFetchedRef = useRef(false);
  const lastFetchParamsRef = useRef<string>("");

  useEffect(() => {
    if (categoriesFetchedRef.current) return;
    categoriesFetchedRef.current = true;

    const fetchCategories = async () => {
      try {
        const cats = await resourceRepository.getCategories();
        setCategories(cats);
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    };
    fetchCategories();
  }, []);

  const fetchResources = useCallback(
    async (force = false) => {
      const paramsKey = JSON.stringify({
        category: activeCategory,
        search: searchQuery,
        page: currentPage,
        limit: initialLimit,
      });

      if (!force && lastFetchParamsRef.current === paramsKey) {
        return;
      }

      lastFetchParamsRef.current = paramsKey;
      setLoading(true);

      try {
        const response = await resourceRepository.getResources({
          category: activeCategory,
          search: searchQuery,
          page: currentPage,
          limit: initialLimit,
        });

        setResources(response.data);
        setTotalItems(response.total);
      } catch (error) {
        setResources([]);
        lastFetchParamsRef.current = "";
      } finally {
        setLoading(false);
      }
    },
    [activeCategory, searchQuery, currentPage, initialLimit],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchResources();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchResources]);

  const downloadResource = useCallback(async (id: number, title: string) => {
    try {
      await resourceRepository.downloadResource(id, title);
      return true;
    } catch (error: unknown) {
      throw error;
    }
  }, []);

  const previewResource = useCallback(async (id: number) => {
    try {
      return await resourceRepository.previewResource(id);
    } catch (error: unknown) {
      throw error;
    }
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory((prev) => {
      if (prev === categoryId) return prev;
      setCurrentPage(1);
      return categoryId;
    });
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery((prev) => {
      if (prev === query) return prev;
      setCurrentPage(1);
      return query;
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const uploadResource = useCallback(
    async (data: UploadResourceDTO) => {
      try {
        await resourceRepository.uploadResource(data);
        fetchResources(true);
        return true;
      } catch (error) {
        return false;
      }
    },
    [fetchResources],
  );

  const updateResource = useCallback(
    async (id: number, data: UpdateResourceDTO) => {
      try {
        await resourceRepository.updateResource(id, data);
        fetchResources(true);
        return true;
      } catch (error) {
        throw error;
      }
    },
    [fetchResources],
  );

  const deleteResource = useCallback(
    async (id: number) => {
      try {
        await resourceRepository.deleteResource(id);
        fetchResources(true);
        return true;
      } catch (error) {
        throw error;
      }
    },
    [fetchResources],
  );

  const totalPages = Math.ceil(totalItems / initialLimit);

  return {
    resources,
    categories,
    loading,
    activeCategory,
    searchQuery,
    currentPage,
    totalPages,
    totalItems,
    downloadResource,
    previewResource,
    setCategory: handleCategoryChange,
    setSearch: handleSearchChange,
    setPage: handlePageChange,
    refresh: () => fetchResources(true),
    uploadResource,
    updateResource,
    deleteResource,
  };
};
