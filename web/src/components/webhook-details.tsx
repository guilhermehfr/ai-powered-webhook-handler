import { useSuspenseQuery } from '@tanstack/react-query';
import { webhookDetailSchema } from '../http/schemas/webhooks';
import { WebhookDetailHeader } from './webhook-detail-header';
import { SectionTitle } from './section-title';
import { SectionDataTable } from './section-data-table';
import { CodeBlock } from './ui/code-block';
import { CopyIconButton } from './ui/copy-icon-button';
import { twMerge } from 'tailwind-merge';
import { API_URL } from '../http/client';

interface WebhookDetailsProps {
  id: string;
}

export function WebhookDetails({ id }: WebhookDetailsProps) {
  const { data } = useSuspenseQuery({
    queryKey: ['webhook', id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/webhooks/${id}`);
      const data = await response.json();
      return webhookDetailSchema.parse(data);
    },
  });

  const overviewData = [
    { key: 'Method', value: data.method },
    { key: 'StatusCode', value: String(data.statusCode) },
    { key: 'ContentType', value: data.contentType || 'application/json' },
    {
      key: 'ContentLength',
      value: `${String(data.contentLength) || '0'} bytes`,
    },
  ];

  const headers = Object.entries(data.headers).map(([key, value]) => ({
    key,
    value: String(value),
  }));

  const queryParams = Object.entries(data.queryParams || {}).map(
    ([key, value]) => ({
      key,
      value: String(value),
    }),
  );

  return (
    <div className="flex h-full flex-col">
      <WebhookDetailHeader
        method={data.method}
        pathname={data.pathname}
        ip={data.ip}
        createdAt={data.createdAt}
      />
      <div
        className={twMerge(
          'flex-1 overflow-y-auto sm:[&::-webkit-scrollbar]:w-4 [&::-webkit-scrollbar]:w-4 ',
          '[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700',
          '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-zinc-700/40',
          '[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full',
        )}
      >
        <div className="space-y-6 p-6">
          <div className="space-y-4">
            <SectionTitle>Request Overview</SectionTitle>
            <SectionDataTable data={overviewData} />
          </div>

          <div className="space-y-4">
            <SectionTitle>Headers</SectionTitle>
            <SectionDataTable data={headers} />
          </div>

          {queryParams.length > 0 && (
            <div className="space-y-4">
              <SectionTitle>Query Parameters</SectionTitle>
              <SectionDataTable data={queryParams} />
            </div>
          )}

          {!!data.body && (
            <div className="space-y-4">
              <SectionTitle>Request Body</SectionTitle>
              <CodeBlock code={data.body} language="json">
                <CopyIconButton textToCopy={data.body} />
              </CodeBlock>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
