import { useEffect, useRef, useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';

import { WebhooksListItem } from './webhooks-list-item';
import { webhookListSchema } from '../http/schemas/webhooks';
import { twMerge } from 'tailwind-merge';
import { CodeBlock, CodeBlockCopyIconButton } from './ui/code-block';
import { API_URL } from '../http/client';

export function WebhooksList() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>(null);
  const lastRequestRef = useRef<{ ids: string[]; code: string } | null>(null);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const [cooldown, setCooldown] = useState(0);
  const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([]);
  const [generatedHandlerCode, setGeneratedHandlerCode] = useState<
    string | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFetchingCode, setIsFetchingCode] = useState(false);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['webhooks'],
      queryFn: async ({ pageParam }) => {
        const url = new URL(`${API_URL}/api/webhooks`);

        if (pageParam) {
          url.searchParams.append('cursor', pageParam);
        }

        const response = await fetch(url);
        const data = await response.json();
        return webhookListSchema.parse(data);
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined;
      },
      initialPageParam: undefined as string | undefined,
    });

  const webhooks = data.pages.flatMap((page) => page.webhooks);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  function startCooldown() {
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }

    setCooldown(2);

    cooldownIntervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current!);
          cooldownIntervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleWebhookChecked(webhookId: string) {
    setCheckedWebhooksIds((state) => {
      if (state.includes(webhookId)) {
        return state.filter((id) => id !== webhookId);
      }
      return [...state, webhookId];
    });
  }

  const hasAnyWebhookChecked = checkedWebhooksIds.length > 0;

  async function handleGenerateHandler() {
    setIsDialogOpen(true);

    const isSameIds =
      lastRequestRef.current?.ids.length === checkedWebhooksIds.length &&
      checkedWebhooksIds.every((id) =>
        lastRequestRef.current!.ids.includes(id),
      );

    if (isSameIds && lastRequestRef.current) return;

    setGeneratedHandlerCode(null);
    setIsFetchingCode(true);

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhooksIds: checkedWebhooksIds }),
      });

      const data = await response.json();
      lastRequestRef.current = { ids: checkedWebhooksIds, code: data.code };
      setGeneratedHandlerCode(data.code);
    } finally {
      setIsFetchingCode(false);
    }
  }

  function handleDialogOpenChange(open: boolean) {
    setIsDialogOpen(open);

    if (!open) {
      startCooldown();
    }
  }

  return (
    <>
      <div
        className={twMerge(
          'flex-1 overflow-y-auto',
          'sm:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-track]:bg-zinc-700/40',
          '[&::-webkit-scrollbar-thumb]:bg-zinc-700',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
        )}
      >
        <div className="space-y-1 p-2">
          {webhooks.map((webhook) => (
            <WebhooksListItem
              key={webhook.id}
              webhook={webhook}
              onWebhookChecked={handleWebhookChecked}
              isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
            />
          ))}
        </div>

        {hasNextPage && (
          <div className="p-2" ref={loadMoreRef}>
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="size-5 animate-spin text-zinc-500" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex px-3 pb-3">
        <button
          disabled={!hasAnyWebhookChecked || cooldown > 0}
          className={twMerge(
            'w-full bg-indigo-400 text-white h-10 flex items-center justify-center gap-2 font-medium rounded-full',
            'disabled:opacity-50 disabled:cursor-not-allowed transition-disabled duration-150',
          )}
          onClick={handleGenerateHandler}
        >
          <Wand2 className="size-4" />
          {cooldown > 0 ? `On cooldown... ${cooldown}s` : 'Generate Handler'}
        </button>
      </div>

      <Dialog.Root open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <Dialog.Overlay className="fixed inset-0 bg-black/[0.67] z-20" />

        <Dialog.Content
          aria-describedby={undefined}
          className="flex items-center justify-center fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 max-h-[85vh] w-[90vw] max-w-[500px]"
        >
          <Dialog.Title className="hidden" />

          {isFetchingCode || !generatedHandlerCode ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="size-5 animate-spin text-zinc-500" />
            </div>
          ) : (
            <CodeBlock
              code={generatedHandlerCode}
              className="bg-zinc-900"
              language="typescript"
            >
              <CodeBlockCopyIconButton />
            </CodeBlock>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
