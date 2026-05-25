
import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastOptions {
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

export interface ToastItem {
  id: string;
  title: string;
  type: ToastType;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  dismissible?: boolean;
}

type Listener = (toasts: ToastItem[]) => void;
let listeners: Listener[] = [];
let memoryToasts: ToastItem[] = [];
const timerMap = new Map<string, ReturnType<typeof setTimeout>>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...memoryToasts]));
};

const genId = () => Math.random().toString(36).substring(2, 9);

const addToast = (
  title: string,
  type: ToastType,
  options?: ToastOptions
) => {
  const id = genId();
  const newToast: ToastItem = {
    id,
    title,
    type,
    ...options,
    dismissible: options?.dismissible ?? true,
    duration: options?.duration ?? (type === 'error' ? 5000 : 4000),
  };

  memoryToasts = [...memoryToasts, newToast];

  // Cap at 10 toasts max to prevent unbounded growth
  if (memoryToasts.length > 10) {
    const removed = memoryToasts.slice(0, memoryToasts.length - 10);
    memoryToasts = memoryToasts.slice(memoryToasts.length - 10);
    // Clear timers for evicted toasts
    removed.forEach((t) => {
      const timer = timerMap.get(t.id);
      if (timer) {
        clearTimeout(timer);
        timerMap.delete(t.id);
      }
    });
  }

  notifyListeners();

  if (newToast.duration !== Infinity) {
    const timer = setTimeout(() => {
      timerMap.delete(id);
      dismiss(id);
    }, newToast.duration);
    timerMap.set(id, timer);
  }

  return id;
};

const dismiss = (id: string) => {
  // Clear associated timer to prevent stale callbacks
  const timer = timerMap.get(id);
  if (timer) {
    clearTimeout(timer);
    timerMap.delete(id);
  }
  memoryToasts = memoryToasts.filter((t) => t.id !== id);
  notifyListeners();
};

export const toast = {
  success: (message: string, options?: ToastOptions) => addToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => addToast(message, 'error', options),
  warning: (message: string, options?: ToastOptions) => addToast(message, 'warning', options),
  info: (message: string, options?: ToastOptions) => addToast(message, 'info', options),
  loading: (message: string, options?: ToastOptions) => addToast(message, 'loading', { ...options, duration: Infinity }),
  dismiss: (id: string) => dismiss(id),
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: ToastOptions
  ) => {
    const id = addToast(messages.loading, 'loading', { ...options, duration: Infinity });

    promise
      .then((data) => {
        dismiss(id);
        const successMessage = typeof messages.success === 'function' ? messages.success(data) : messages.success;
        addToast(successMessage, 'success', options);
      })
      .catch((err) => {
        dismiss(id);
        const errorMessage = typeof messages.error === 'function' ? messages.error(err) : messages.error;
        addToast(errorMessage, 'error', options);
      });

    return promise;
  }
};

export const showToast = (message: string, type: ToastType = 'success') => {
  addToast(message, type);
};

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

const TOAST_STYLES = {
  success: 'bg-white border-emerald-200 dark:bg-slate-900 dark:border-emerald-900/50',
  error: 'bg-white border-rose-200 dark:bg-slate-900 dark:border-rose-900/50',
  warning: 'bg-white border-amber-200 dark:bg-slate-900 dark:border-amber-900/50',
  info: 'bg-white border-blue-200 dark:bg-slate-900 dark:border-blue-900/50',
  loading: 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800',
};

const ICON_COLORS = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  loading: 'text-slate-500',
};

const ToastCard = ({
  item,
  index,
  total,
  onDismiss
}: {
  item: ToastItem;
  index: number;
  total: number;
  onDismiss: (id: string) => void;
}) => {
  const Icon = TOAST_ICONS[item.type];

  // Stack: newest on top (index 0), older ones push down
  const reverseIndex = total - 1 - index;

  if (reverseIndex > 2) return null;

  const yOffset = reverseIndex * 14;
  const scale = 1 - reverseIndex * 0.05;
  const opacity = 1 - reverseIndex * 0.2;

  return (
    <li
      className={`
        absolute top-0 left-0 right-0 mx-auto
        w-full max-w-[380px] 
        flex items-start gap-4 p-4 
        rounded-2xl border shadow-lg backdrop-blur-md
        pointer-events-auto
        animate-in fade-in slide-in-from-top-6 duration-300
        transition-all ease-out
        ${TOAST_STYLES[item.type]}
      `}
      style={{
        transformOrigin: 'top center',
        transform: `translateY(${yOffset}px) scale(${scale})`,
        opacity: opacity,
        zIndex: total - reverseIndex,
        transitionProperty: 'transform, opacity',
        transitionDuration: '300ms',
      }}
    >
      <div className={`shrink-0 ${item.type === 'loading' ? 'animate-spin' : ''}`}>
        <Icon size={22} className={ICON_COLORS[item.type]} />
      </div>

      <div className="flex-1 space-y-1">
        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {item.description}
          </p>
        )}
        {item.action && (
          <button
            onClick={item.action.onClick}
            className="mt-2 text-xs font-medium px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {item.action.label}
          </button>
        )}
      </div>

      {item.dismissible && (
        <button
          onClick={() => onDismiss(item.id)}
          className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </li>
  );
};

export const SimpleToaster = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-[400px] flex flex-col justify-start pointer-events-none px-4 md:px-0"
      style={{ height: '200px' }}
    >
      <ul className="relative w-full h-full flex flex-col justify-start items-center pointer-events-none">
        {toasts.slice(-4).map((item, index, arr) => (
          <ToastCard
            key={item.id}
            item={item}
            index={index}
            total={arr.length}
            onDismiss={dismiss}
          />
        ))}
      </ul>
    </div>
  );
};