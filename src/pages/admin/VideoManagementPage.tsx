import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdminContentStatus } from '../../api/types';
import AdminButton from '../../components/ui/AdminButton';
import AdminVideo from '../../components/ui/AdminVideo';
import { Icon } from '../../components/ui/Icon';
import Input from '../../components/ui/Input';
import { http } from '../../api/http';
import adminApi from '../../api/adminApi';

interface FixedContentType {
  fixedContentId: number;
  url: string;
  status: AdminContentStatus;
}

const DeleteButton = ({ onClick }: { onClick: VoidFunction }) => {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-[14px] right-[14px] size-[30px] inline-flex justify-center items-center rounded-[8px] bg-black/60 cursor-pointer"
    >
      <Icon.Trash2 className="size-4 stroke-white" />
    </button>
  );
};

const VideoManagementPage = () => {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState('');

  const { data } = useQuery({
    queryKey: ['fixedContent'],
    queryFn: () => http.get<FixedContentType[]>('/api/admin/fixed-contents'),
  });

  const { mutate: deleteContent } = useMutation({
    mutationFn: adminApi.deleteFixedContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedContent'] });
    },
    onError: (error) => {
      console.error('영상 삭제 실패:', error);
      alert('영상 삭제에 실패했습니다.');
    },
  });

  const { mutate: addContent, isPending: isAdding } = useMutation({
    mutationFn: adminApi.addFixedContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedContent'] });
      setImageUrl('');
    },
    onError: (error) => {
      console.error('영상 추가 실패:', error);
      alert('영상 추가에 실패했습니다.');
    },
  });

  const handleDelete = (fixedContentId: number) => {
    if (window.confirm('정말로 이 영상을 삭제하시겠습니까?')) {
      deleteContent(fixedContentId);
    }
  };

  const handleAdd = () => {
    const trimmedUrl = imageUrl.trim();
    if (!trimmedUrl) {
      alert('이미지 URL을 입력해주세요.');
      return;
    }
    if (window.confirm('이 URL로 이미지를 추가하시겠습니까?')) {
      addContent({ imageUrl: trimmedUrl });
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <main className="py-[40px_120px]">
      <div className="w-[min(calc(100%-100px),1200px)] h-full mx-auto">
        <div className="flex gap-2 pb-10">
          <Input
            className="flex-1 h-[50px]"
            placeholder="이미지 URL 입력"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <AdminButton size={50} onClick={handleAdd} disabled={isAdding}>
            {isAdding ? '추가 중...' : '이미지 추가'}
          </AdminButton>
        </div>
        <div>
          <span className="inline-flex pb-3 font-medium text-[14px]">
            총 {data?.length ?? 0}개
          </span>
          <div className="grid grid-cols-4 gap-5">
            {data?.map((content) => {
              if (content.status === 'PROCESSING') {
                return (
                  <div
                    key={content.fixedContentId}
                    className="relative flex items-center justify-center bg-[#DCE2E6] border-1 border-[#E9E9E9] rounded-[12px]"
                  >
                    <Icon.LoaderCircle className="stroke-white size-8 animate-spin" />
                  </div>
                );
              } else if (content.status === 'FAILED') {
                return (
                  <div
                    key={content.fixedContentId}
                    className="relative flex items-center justify-center bg-[#DCE2E6] border-1 border-[#E9E9E9] rounded-[12px]"
                  >
                    <span className="font-semibold text-[24px] text-[#BDC4C8]">
                      생성실패
                    </span>
                    <DeleteButton
                      onClick={() => handleDelete(content.fixedContentId)}
                    />
                  </div>
                );
              }
              return (
                <div
                  key={content.fixedContentId}
                  className="relative bg-[#DCE2E6] border-1 border-[#E9E9E9] rounded-[12px]"
                >
                  <AdminVideo videoUrl={content.url} />
                  <DeleteButton
                    onClick={() => handleDelete(content.fixedContentId)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default VideoManagementPage;
