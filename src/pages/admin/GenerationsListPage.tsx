import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import GenerationsListItem from '../../components/admin/GenerationListItem';
import AdminButton from '../../components/ui/AdminButton';
import adminApi from '../../api/adminApi';
import { Fragment, useRef, useCallback } from 'react';
import type { GenerationsResponse } from '../../api/types';

const GenerationsListPage = () => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery<
    GenerationsResponse, // queryFn이 반환하는 데이터 타입
    Error, // 에러 타입
    InfiniteData<GenerationsResponse>, // select 함수 등으로 가공된 최종 데이터 타입
    string[], // 쿼리 키 타입
    number | undefined // pageParam 타입
  >({
    queryKey: ['generations'],
    queryFn: ({ pageParam }) =>
      adminApi.getGenerations({ lastId: pageParam, limit: 12 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      // 서버에서 받은 데이터가 limit(12)보다 적으면 마지막 페이지로 간주합니다.
      if (lastPage.list.length < 12) {
        return undefined;
      }
      const lastItem = lastPage.list[lastPage.list.length - 1];
      return lastItem ? lastItem.contentId : undefined;
    },
  });

  // Intersection Observer를 위한 설정
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
  const totalCount = data.pages[0]?.count ?? allGenerations.length;

  return (
    <div className="w-[min(calc(100%-100px),1200px)] h-full mx-auto">
      <div className="flex justify-between pb-6">
        <div className="text-[20px] font-semibold">
          <span>총 생성 수</span>
          <span className="text-cxs-primary ml-0.5">({totalCount})</span>
        </div>
        <AdminButton>키워드 변경하기</AdminButton>
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

      {/* 감시 대상 요소: 이 요소가 보이면 다음 페이지를 불러옵니다. */}
      <div ref={observerRef} style={{ height: '1px' }} />

      {/* 다음 페이지 로딩 중 인디케이터 */}
      {isFetchingNextPage && (
        <p className="text-center py-4">다음 목록을 불러오는 중...</p>
      )}
    </div>
  );
};

export default GenerationsListPage;
