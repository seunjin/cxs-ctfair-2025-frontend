import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import GenerationsListItem from '../../components/admin/GenerationListItem';
import AdminButton from '../../components/ui/AdminButton';
import adminApi from '../../api/adminApi';
import { Fragment, useRef, useCallback } from 'react';
import type { GenerationsResponse } from '../../api/types';
import { useDialogs } from '../../lib/dialogs';
import KeywordManagerModal from '../../templates/modal/KeywordManagerModal';
import clsx from 'clsx';
import { useSearchParams } from 'react-router-dom';

type FilterStatus = 'ALL' | 'FAILED';

const GenerationsListPage = () => {
  const { openDialog } = useDialogs();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterStatus = (searchParams.get('filter') as FilterStatus) || 'ALL';

  const setFilterStatus = (status: FilterStatus) => {
    setSearchParams(status === 'ALL' ? {} : { filter: status });
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery<
    GenerationsResponse,
    Error,
    InfiniteData<GenerationsResponse>,
    (string | FilterStatus)[],
    number | undefined
  >({
    queryKey: ['generations', filterStatus],
    queryFn: ({ pageParam }) =>
      adminApi.getGenerations({
        lastId: pageParam,
        limit: 12,
        sorting: filterStatus === 'FAILED' ? 'FAILED' : undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.list.length < 12) {
        return undefined;
      }
      const lastItem = lastPage.list[lastPage.list.length - 1];
      return lastItem ? lastItem.contentId : undefined;
    },
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  if (isPending) {
    return <p className="text-center">로딩 중...</p>;
  }

  if (isError) {
    return <p className="text-center">에러가 발생했습니다: {error.message}</p>;
  }

  const allGenerations = data.pages.flatMap((page) => page.list);
  const totalCount = data.pages[0]?.count ?? 0;
  const failedCount = data.pages[0]?.failedCount ?? 0;

  return (
    <main className="py-[40px_120px]">
      <div className="w-[min(calc(100%-100px),1200px)] h-full mx-auto">
        <div className="flex justify-between pb-6">
          <div className="flex items-center gap-4">
            <div className="text-[20px] font-semibold">
              <span>총 생성 수</span>
              <span className="text-cxs-primary ml-0.5">({totalCount})</span>

              <span className="text-gray-400 mx-1">|</span>
              <span>실패</span>
              <span className="text-red-500 ml-0.5">({failedCount})</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#F1F3F5] p-1">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={clsx(
                  'px-4 py-1 rounded-full text-[14px] font-medium duration-200',
                  filterStatus === 'ALL'
                    ? 'bg-white text-black shadow'
                    : 'text-[#818A92] hover:bg-white/50'
                )}
              >
                전체
              </button>
              <button
                onClick={() => setFilterStatus('FAILED')}
                className={clsx(
                  'px-4 py-1 rounded-full text-[14px] font-medium duration-200',
                  filterStatus === 'FAILED'
                    ? 'bg-white text-black shadow'
                    : 'text-[#818A92] hover:bg-white/50'
                )}
              >
                실패
              </button>
            </div>
          </div>
          <AdminButton
            onClick={() =>
              openDialog('modal', { children: <KeywordManagerModal /> })
            }
          >
            키워드 변경하기
          </AdminButton>
        </div>

        {allGenerations.length > 0 ? (
          <div className="grid grid-cols-4 gap-[50px_20px]">
            {data.pages.map((page, i) => (
              <Fragment key={i}>
                {page.list.map((item) => (
                  <GenerationsListItem
                    key={item.contentId}
                    contentId={item.contentId}
                    status={item.status}
                    smsStatus={item.smsStatus}
                    imageUrl={item.imageUrl}
                    createdAt={new Date(item.createdAt)}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        ) : (
          <p className="text-center py-10">생성된 콘텐츠가 없습니다.</p>
        )}

        <div ref={observerRef} style={{ height: '1px' }} />

        {isFetchingNextPage && (
          <p className="text-center py-4">다음 목록을 불러오는 중...</p>
        )}
      </div>
    </main>
  );
};

export default GenerationsListPage;
