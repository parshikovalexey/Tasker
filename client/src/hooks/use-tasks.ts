import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storage } from "@/lib/storage";

const TASKS_KEY = ["tasks"];

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: () => storage.getAll(),
  });
}

export function useAddTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, text, color }: { key: string; text: string; color?: string }) => {
      return storage.addTask(key, text, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      from,
      to,
      text,
      color,
    }: {
      id: string;
      from: string;
      to: string;
      text?: string;
      color?: string;
    }) => {
      return storage.moveTask(id, from, to, text, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useCompleteEverydayTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      return storage.completeEverydayTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}
